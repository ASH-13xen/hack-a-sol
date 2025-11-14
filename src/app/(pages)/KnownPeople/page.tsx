"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User, Trash, Edit, ScanFace } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";

// This is the main page component
export default function KnownPeoplePage() {
  const people = useQuery(api.people.getRecognizedPeople);
  const deletePerson = useMutation(api.people.deletePerson);

  const handleDelete = (id: Id<"recognized_people">, name: string) => {
    // We use confirm() for simplicity, but a Shadcn <AlertDialog> is better
    if (
      confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)
    ) {
      toast.promise(deletePerson({ personId: id }), {
        loading: `Deleting ${name}...`,
        success: `${name} has been deleted.`,
        error: `Failed to delete ${name}.`,
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Known People</h1>
        <Button asChild>
          <Link href="/">
            <ScanFace className="mr-2 h-4 w-4" /> Scan / Add New
          </Link>
        </Button>
      </div>

      {/* 1. Loading State */}
      {people === undefined && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {/* 2. Empty State */}
      {people && people.length === 0 && (
        <div className="text-center h-64 flex flex-col justify-center items-center border-2 border-dashed rounded-lg">
          <User className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No People Registered</h3>
          <p className="text-muted-foreground">
            Click Scan / Add New to register your first person.
          </p>
        </div>
      )}

      {/* 3. Data State */}
      {people && people.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map((person) => (
            <Card key={person._id} className="flex flex-col overflow-hidden">
              <CardHeader>
                <CardTitle>{person.full_name}</CardTitle>
                <CardDescription className="text-base">
                  {person.relationship}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-4">
                {/* --- NEW: Display the image from Convex Storage --- */}
                {person.displayImageUrl ? (
                  <div className="relative w-full h-48 rounded-md overflow-hidden border">
                    <img
                      src={person.displayImageUrl}
                      alt={person.full_name}
                      className="w-full h-full object-cover"
                      // Fallback placeholder
                      onError={(e) =>
                        (e.currentTarget.src =
                          "https://placehold.co/400x300/e2e8f0/64748b?text=Image+Not+Found")
                      }
                    />
                  </div>
                ) : (
                  // Placeholder if no image was stored
                  <div className="w-full h-48 rounded-md bg-gray-100 flex items-center justify-center border">
                    <User className="size-16 text-gray-300" />
                  </div>
                )}
                {/* --- End of new image --- */}

                <div>
                  <p className="text-muted-foreground text-sm">Notes:</p>
                  <p className="line-clamp-4">
                    {person.description || "No notes for this person yet."}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-2">
                <Button variant="outline" asChild>
                  {/* This links back to the scanner page */}
                  <Link href="/">
                    <Edit className="mr-2 h-4 w-4" /> Edit Notes
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(person._id, person.full_name)}
                >
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
