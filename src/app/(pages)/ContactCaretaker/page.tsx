"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Video, MessageSquare } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";


export default function ContactCaretakerPage() {
  const { user } = useUser();
  const userId = user?.id ?? "";

  // Fetch caretakers from Convex
  const caretakers = useQuery(api.caretakers.getCaretakers, { userId });

  // Mutation to add caretaker
  const addCaretaker = useMutation(api.caretakers.addCaretaker);

  // Form state
  const [form, setForm] = useState({
    name: "",
    relation: "",
    phone: "",
    email: "",
    avatar: "👤",
    available: true,
  });

  // Simple handler
  const handleSubmit = async () => {
    if (!userId) return alert("You must be logged in.");

    await addCaretaker({
      userId,
      ...form,
    });

    setForm({
      name: "",
      relation: "",
      phone: "",
      email: "",
      avatar: "👤",
      available: true,
    });
  };

  return (
    <div className="p-6 md:p-10 w-full">

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-[#7c4141] hover:text-[#eba85c] transition-colors flex items-center gap-2 mb-4"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-[#4c3024] mb-2 flex items-center gap-3">
          <Phone className="h-10 w-10 text-[#7c4141]" />
          Contact Caretaker
        </h1>

        <p className="text-[#4c3024]/70">Reach out to your care team anytime</p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">

        {/* Emergency 112 Button */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-8 mb-8 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Emergency</h2>
              <p className="text-white/90">Press here if you need immediate help</p>
            </div>

            <a href="tel:112">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-red-50 text-xl py-6 px-8"
              >
                <Phone className="h-6 w-6 mr-2" />
                Call 112
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Add Caretaker Form */}
        <div className="bg-white/70 border-2 border-[#dabe72]/30 p-6 rounded-xl mb-10">
          <h2 className="text-xl font-semibold text-[#4c3024] mb-4">Add Caretaker</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Name"
              className="p-2 border rounded-md"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Relation"
              className="p-2 border rounded-md"
              value={form.relation}
              onChange={(e) => setForm({ ...form, relation: e.target.value })}
            />
            <input
              placeholder="Phone"
              className="p-2 border rounded-md"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              placeholder="Email"
              className="p-2 border rounded-md"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <Button onClick={handleSubmit} className="mt-4">
            Add Caretaker
          </Button>
        </div>

        {/* Caretaker Cards */}
        <div className="space-y-4">
          {!caretakers ? (
            <p className="text-[#4c3024]/60">Loading caretakers…</p>
          ) : caretakers.length === 0 ? (
            <p className="text-[#4c3024]/60">No caretakers added yet.</p>
          ) : (
            caretakers.map((caretaker, index) => (
              <motion.div
                key={caretaker._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/50 backdrop-blur-sm rounded-xl border-2 border-[#dabe72]/30 p-6 hover:border-[#eba85c] transition-all shadow-lg"
              >
                <div className="flex items-start justify-between">

                  {/* Caretaker Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#7c4141]/10 to-[#eba85c]/10 rounded-full flex items-center justify-center text-3xl border-2 border-[#dabe72]/20">
                      {caretaker.avatar}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold text-[#4c3024]">
                          {caretaker.name}
                        </h3>
                      </div>

                      <p className="text-sm text-[#7c4141] mb-2">
                        {caretaker.relation}
                      </p>

                      <div className="space-y-1 text-sm text-[#4c3024]/70">
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {caretaker.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {caretaker.email}
                        </p>
                      </div>
                    </div>
                  </div>
{/* Action Buttons */}
<div className="flex flex-col gap-2">

  {/* Call Button */}
  <a href={`tel:${caretaker.phone}`}>
    <Button className="gap-2">
      <Phone className="h-4 w-4" />
      Call
    </Button>
  </a>

  {/* Email Button */}
  <a href={`mailto:${caretaker.email}`}>
    <Button variant="outline" className="gap-2">
      <MessageSquare className="h-4 w-4" />
      Message
    </Button>
  </a>

</div>

                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
