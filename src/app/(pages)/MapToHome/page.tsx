"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Home, Save, Info, Trash } from "lucide-react";
import { toast } from "sonner";

// This component handles the "Set Home" form
function SetHomeForm() {
  const [mapUrl, setMapUrl] = useState("");
  const [streetViewUrl, setStreetViewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const setHomeLocation = useMutation(api.home.set);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simple validation
    if (
      !mapUrl.includes("https://www.google.com/maps/embed") ||
      !streetViewUrl.includes("https://www.google.com/maps/embed")
    ) {
      toast.error("Invalid Embed URL", {
        description:
          "Please make sure you copy the 'Embed a map' URL from Google Maps.",
      });
      setIsSaving(false);
      return;
    }

    toast.promise(
      setHomeLocation({
        mapEmbedUrl: mapUrl,
        streetViewEmbedUrl: streetViewUrl, // This was the corrected field name
      }),
      {
        loading: "Saving home location...",
        success: "Home location saved!",
        error: "Failed to save location.",
      }
    );
    // Don't set isSaving(false) here, let the query reload show the new UI
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Set Your Home Location</CardTitle>
        <CardDescription>
          You only need to do this once. Follow the steps below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How to get Embed URLs:</AlertTitle>
          <AlertDescription>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Go to{" "}
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Google Maps
                </a>
                .
              </li>
              <li>Find your home address.</li>
              <li>
                Click the **Share** button, then go to the **Embed a map** tab.
              </li>
              <li>
                Copy the URL from the `src=...` attribute and paste it below.
              </li>
              <li>
                Drag the map to Street View, click Share again, and get the
                Street View embed URL.
              </li>
            </ol>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="map-url">1. Map Embed URL</Label>
            <Input
              id="map-url"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              placeholder="Paste the 'Embed a map' URL here"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="street-view-url">2. Street View Embed URL</Label>
            <Input
              id="street-view-url"
              value={streetViewUrl}
              onChange={(e) => setStreetViewUrl(e.target.value)}
              placeholder="Paste the 'Embed a map (Street View)' URL here"
              required
            />
          </div>
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Home Location
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// This component displays the saved home location
function ViewHomeLocation({
  mapUrl,
  streetViewUrl,
}: {
  mapUrl: string;
  streetViewUrl: string;
}) {
  const clearHomeLocation = useMutation(api.home.clear);
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = () => {
    if (confirm("Are you sure you want to clear your saved home location?")) {
      setIsClearing(true);
      toast.promise(clearHomeLocation(), {
        loading: "Clearing location...",
        success: "Home location cleared.",
        error: "Failed to clear location.",
      });
      // The page will auto-reload via the query hook
    }
  };

  // This creates a directions URL, using the embed URL as the destination.
  // Google Maps is smart enough to parse its own embed URL.
  const openDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    mapUrl
  )}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Street View Card */}
      <Card>
        <CardHeader>
          <CardTitle>Home: Street View</CardTitle>
          <CardDescription>
            A visual reminder of what home looks like.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <iframe
            src={streetViewUrl}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-md"
          ></iframe>
        </CardContent>
      </Card>

      {/* Map Card */}
      <Card>
        <CardHeader>
          <CardTitle>Home: Map</CardTitle>
          <CardDescription>This is your saved home address.</CardDescription>
        </CardHeader>
        <CardContent>
          <iframe
            src={mapUrl}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-md"
          ></iframe>
        </CardContent>
      </Card>

      {/* Button to open directions in Google Maps */}
      <Button asChild size="lg" className="lg:col-span-2 text-lg">
        <a href={openDirectionsUrl} target="_blank" rel="noopener noreferrer">
          <Home className="mr-2 h-5 w-5" /> Open Directions to Home
        </a>
      </Button>

      <Button
        variant="destructive"
        onClick={handleClear}
        disabled={isClearing}
        className="lg:col-span-2"
      >
        <Trash className="mr-2 h-4 w-4" /> Clear Saved Home
      </Button>
    </div>
  );
}

// This is the main page component
export default function MapToHomePage() {
  const homeLocation = useQuery(api.home.get);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Map to Home</h1>

      {/* 1. Loading State */}
      {homeLocation === undefined && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {/* 2. No Home Set State */}
      {homeLocation === null && <SetHomeForm />}

      {/* 3. Home is Set State (check both URLs) */}
      {homeLocation &&
        homeLocation.mapEmbedUrl &&
        homeLocation.streetViewEmbedUrl && (
          <ViewHomeLocation
            mapUrl={homeLocation.mapEmbedUrl}
            streetViewUrl={homeLocation.streetViewEmbedUrl}
          />
        )}

      {/* 4. Partial state (if one URL is missing, reset) */}
      {homeLocation &&
        (!homeLocation.mapEmbedUrl || !homeLocation.streetViewEmbedUrl) && (
          <SetHomeForm />
        )}
    </div>
  );
}
