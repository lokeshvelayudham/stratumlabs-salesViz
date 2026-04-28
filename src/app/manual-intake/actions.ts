"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createManualLead(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const institution = formData.get("institution") as string;
  const role = formData.get("role") as string;
  const eventName = formData.get("eventName") as string;
  const notes = formData.get("notes") as string;
  
  const lead = await prisma.lead.create({
    data: {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      email,
      institution,
      role,
      eventName,
      notes,
      sourceType: "MANUAL",
      sourceName: "User Input",
      status: "NEW",
      tier: "UNRANKED",
    }
  });

  await prisma.activityLog.create({
    data: {
      leadId: lead.id,
      type: "LEAD_CREATED",
      message: `Lead manually added from ${eventName || "unknown event"}`
    }
  });

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  
  redirect(`/leads/${lead.id}`);
}
