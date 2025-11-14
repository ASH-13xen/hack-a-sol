"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import * as faceapi from "face-api.js";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
// --- FIX 1: Import the 'Id' type from Convex ---
import { Id } from "../../../convex/_generated/dataModel";
import {
  Loader2,
  Camera,
  UserPlus,
  Zap,
  CheckCircle,
  AlertTriangle,
  Save,
} from "lucide-react";

// --- Utility Import (comes with Shadcn/UI) ---
import { cn } from "@/lib/utils";

// --- Real Shadcn/UI Imports ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const MODEL_URL = "/models";
const FACE_MATCH_THRESHOLD = 0.55;

// --- TYPES ---
interface MatchedPerson {
  // --- FIX 2: Use the 'Id' type instead of 'string' ---
  _id: Id<"recognized_people">;
  full_name: string;
  relationship: string;
  description: string;
}
type RegistrationStatus = "SCANNING" | "MATCH_FOUND" | "NEW_PERSON";

export default function ScanPersonForm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { userId, isLoaded } = useAuth();

  const [scanStatus, setScanStatus] = useState("Loading AI models...");
  const [loadingModels, setLoadingModels] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [currentStatus, setCurrentStatus] = useState<RegistrationStatus | null>(
    null
  );
  const [detectedDescriptor, setDetectedDescriptor] =
    useState<Float32Array | null>(null);
  const [matchedPerson, setMatchedPerson] = useState<MatchedPerson | null>(
    null
  );

  const [formName, setFormName] = useState("");
  const [formRelationship, setFormRelationship] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const generateUploadUrl = useMutation(api.people.generateUploadUrl);
  const registerPersonWithStorage = useMutation(
    api.people.registerPersonWithStorage
  );
  const recognizedPeople = useQuery(api.people.getRecognizedPeople);
  const updateDescription = useMutation(api.people.updatePersonDescription);

  const faceMatcher = useMemo(() => {
    if (!recognizedPeople || recognizedPeople.length === 0) return null;

    const labeledDescriptors = recognizedPeople
      .map((person) => {
        if (!person.face_embedding || person.face_embedding.length === 0)
          return null;
        return new faceapi.LabeledFaceDescriptors(person.full_name, [
          new Float32Array(person.face_embedding),
        ]);
      })
      .filter(Boolean) as faceapi.LabeledFaceDescriptors[];

    if (labeledDescriptors.length === 0) return null;
    return new faceapi.FaceMatcher(labeledDescriptors, FACE_MATCH_THRESHOLD);
  }, [recognizedPeople]);

  useEffect(() => {
    const loadModelsAndStartVideo = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setScanStatus("Models loaded. Starting camera...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setLoadingModels(false);
        setScanStatus("Ready. Click 'Scan Face' to capture.");
      } catch (err) {
        console.error("Error accessing webcam or loading models:", err);
        setScanStatus(
          "ERROR: Could not access camera or load AI models. (Check 'public/models' folder)"
        );
        setLoadingModels(false);
      }
    };
    loadModelsAndStartVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  const resetState = () => {
    setMatchedPerson(null);
    setDetectedDescriptor(null);
    setCurrentStatus(null);
    setFormName("");
    setFormRelationship("");
    setFormDescription("");
    setIsProcessing(false);
    setIsSaving(false);
  };

  const handleScan = useCallback(async () => {
    if (!videoRef.current || !userId || loadingModels || isProcessing) return;

    setIsProcessing(true);
    setScanStatus("Processing image...");
    resetState();

    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setScanStatus("Face not detected. Please try again.");
        setIsProcessing(false);
        return;
      }

      setDetectedDescriptor(detection.descriptor);

      if (faceMatcher) {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

        if (bestMatch.label !== "unknown") {
          const matchedData = recognizedPeople!.find(
            (p) => p.full_name === bestMatch.label
          );

          if (matchedData) {
            setMatchedPerson({
              _id: matchedData._id,
              full_name: matchedData.full_name,
              relationship: matchedData.relationship,
              description: matchedData.description || "",
            });
            setFormDescription(matchedData.description || "");
            setCurrentStatus("MATCH_FOUND");
            setScanStatus(`MATCH: Recognized ${matchedData.full_name}.`);
            setIsProcessing(false);
            return;
          }
        }
      }

      setCurrentStatus("NEW_PERSON");
      setScanStatus("NEW PERSON. Please fill out the form.");
      setIsProcessing(false);
    } catch (error) {
      console.error("Scan failed:", error);
      setScanStatus("Scan failed. Try restarting the page.");
      setIsProcessing(false);
    }
  }, [
    userId,
    loadingModels,
    isProcessing,
    faceMatcher,
    recognizedPeople,
    setScanStatus,
  ]);

  // --- Combined Save/Update Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);

    // --- BRANCH 1: UPDATE EXISTING PERSON ---
    if (currentStatus === "MATCH_FOUND" && matchedPerson) {
      setScanStatus(`Updating notes for ${matchedPerson.full_name}...`);
      try {
        await updateDescription({
          personId: matchedPerson._id,
          newDescription: formDescription,
        });

        // --- SONNER TOAST (SUCCESS) ---
        toast.success("Notes Updated!", {
          description: `Your notes for ${matchedPerson.full_name} have been saved.`,
        });

        setScanStatus(`Notes updated for ${matchedPerson.full_name}.`);
        resetState();
        setScanStatus("Ready. Click 'Scan Face' to capture.");
      } catch (error) {
        console.error("Update failed:", error);
        setScanStatus("Error updating notes. See console.");
        toast.error("Update Failed", {
          description: "Could not save notes. See console for details.",
        });
        setIsSaving(false);
      }
    }

    // --- BRANCH 2: REGISTER NEW PERSON ---
    else if (currentStatus === "NEW_PERSON" && detectedDescriptor) {
      if (!formName || !formRelationship) {
        alert("Please fill out both Name and Relationship.");
        setIsSaving(false);
        return;
      }
      setScanStatus("Uploading and registering new face...");

      try {
        const displaySize = { width: 400, height: 300 };
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        if (videoRef.current) {
          ctx.drawImage(
            videoRef.current,
            0,
            0,
            displaySize.width,
            displaySize.height
          );
        } else {
          throw new Error("Video feed not available.");
        }

        const blob: Blob | null = await new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
        });

        if (!blob) throw new Error("Failed to capture image.");
        const file = new File([blob], "face_scan.jpg", { type: "image/jpeg" });

        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();

        await registerPersonWithStorage({
          patient_id: userId,
          full_name: formName,
          relationship: formRelationship,
          description: formDescription, // Save the description
          storage_id: storageId,
          face_embedding: Array.from(detectedDescriptor),
        });

        setScanStatus(`SUCCESS! ${formName} registered.`);
        // --- SONNER TOAST (SUCCESS) ---
        toast.success("Person Registered!", {
          description: `${formName} has been added to your memory database.`,
        });
        resetState();
        setScanStatus("Ready. Click 'Scan Face' to capture.");
      } catch (error) {
        console.error("Registration failed:", error);
        setScanStatus("Registration failed! Check console.");
        toast.error("Registration Failed", {
          description: "Could not save new person. See console for details.",
        });
        setIsSaving(false);
      }
    }
  };

  // --- UI Render Helpers ---
  const getStatusAlertVariant = (): "default" | "destructive" => {
    if (scanStatus.includes("ERROR")) return "destructive";
    return "default";
  };

  const isSuccess =
    scanStatus.includes("SUCCESS") || currentStatus === "MATCH_FOUND";
  const isWarning = currentStatus === "NEW_PERSON";

  const getScanStatusTitle = (): string => {
    if (loadingModels) return "Loading AI...";
    if (isProcessing) return "Scanning...";
    if (scanStatus.includes("ERROR")) return "Error";
    if (isSuccess) return "Success!";
    if (isWarning) return "New Person Found";
    return "Ready to Scan";
  };

  const renderCurrentDisplay = () => {
    // --- STATE 1: MATCH FOUND ---
    if (currentStatus === "MATCH_FOUND" && matchedPerson) {
      return (
        <Card className="border-green-500 border-2">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <CheckCircle /> Person Recognized
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-gray-500">Name</Label>
                <p className="text-2xl font-semibold text-gray-900">
                  {matchedPerson.full_name}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-gray-500">Relationship</Label>
                <p className="text-lg text-gray-800">
                  {matchedPerson.relationship}
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="description-match" className="text-gray-500">
                  Notes / Latest Memory
                </Label>
                <Textarea
                  id="description-match"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Add notes, memories, or context..."
                  className="text-lg min-h-[120px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={isSaving || isProcessing}
                className="w-full text-lg bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin mr-2 size-5" />
                ) : (
                  <Save className="mr-2 size-5" />
                )}
                Update Notes
              </Button>
            </CardFooter>
          </form>
        </Card>
      );
    }

    // --- STATE 2: NEW PERSON ---
    if (currentStatus === "NEW_PERSON") {
      return (
        <Card className="border-indigo-500 border-2">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-indigo-700 flex items-center gap-2">
                <UserPlus /> Register New Person
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name-new">Full Name</Label>
                <Input
                  id="name-new"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="e.g., Arjun"
                  className="text-lg"
                />
              </div>
              <div>
                <Label htmlFor="relationship-new">Relationship</Label>
                <Input
                  id="relationship-new"
                  value={formRelationship}
                  onChange={(e) => setFormRelationship(e.target.value)}
                  required
                  placeholder="e.g., Son, Doctor, Caregiver"
                  className="text-lg"
                />
              </div>
              <div>
                <Label htmlFor="description-new">Notes / First Memory</Label>
                <Textarea
                  id="description-new"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g., Just met at the park..."
                  className="text-lg min-h-[120px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={
                  isSaving ||
                  isProcessing ||
                  !detectedDescriptor ||
                  !formName ||
                  !formRelationship
                }
                className="w-full text-lg"
                size="lg"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin mr-2 size-5" />
                ) : (
                  "Confirm & Register"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      );
    }

    // --- STATE 3: DEFAULT EMPTY ---
    return (
      <Card className="flex flex-col items-center justify-center h-full min-h-[300px] text-center border-dashed">
        <CardContent className="pt-6">
          <Camera className="size-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            Scan results will appear here.
          </p>
        </CardContent>
      </Card>
    );
  };

  // --- Main Component Render ---
  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        NeuroLink Memory Assistant
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Face Scanner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="relative w-full border rounded-lg overflow-hidden shadow-inner bg-gray-100"
              style={{ aspectRatio: "4/3" }}
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                className="absolute top-0 left-0 w-full h-full object-cover scale-x[-1]"
                playsInline
              />
              <canvas
                ref={canvasRef}
                width="400"
                height="300"
                className="absolute top-0 left-0 hidden"
              />

              {loadingModels && (
                <div className="absolute inset-0 bg-gray-900/50 flex flex-col items-center justify-center text-white">
                  <Loader2 className="animate-spin size-8 mb-2" />
                  <p>Loading AI models...</p>
                </div>
              )}
            </div>

            <Alert
              variant={getStatusAlertVariant()}
              className={cn(
                "min-h-[80px]",
                isSuccess &&
                  "border-green-500 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-300",
                isWarning &&
                  "border-yellow-500 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
              )}
            >
              <AlertTitle
                className={cn(
                  "flex items-center gap-2",
                  isSuccess && "text-green-700 dark:text-green-400",
                  isWarning && "text-yellow-700 dark:text-yellow-400"
                )}
              >
                {isProcessing || loadingModels ? (
                  <Loader2 className="animate-spin size-4" />
                ) : isSuccess ? (
                  <CheckCircle className="size-4" />
                ) : isWarning ? (
                  <AlertTriangle className="size-4" />
                ) : (
                  <Zap className="size-4" />
                )}
                {getScanStatusTitle()}
              </AlertTitle>
              <AlertDescription>{scanStatus}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleScan}
              disabled={
                loadingModels ||
                isProcessing ||
                !isLoaded ||
                !userId ||
                recognizedPeople === undefined ||
                isSaving
              }
              className="w-full text-lg"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin mr-2 size-5" />
                  Scanning...
                </>
              ) : (
                <>
                  <Zap className="size-5 mr-2" />
                  Scan Face
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="w-full flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">Scan Result</h2>
          {renderCurrentDisplay()}
        </div>
      </div>
    </div>
  );
}
