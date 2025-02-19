import { logger } from "@v1/logger";
import { createClient } from "@v1/supabase/server";
import { revalidateTag, unstable_cache } from "next/cache";

export async function getUser() {
  const supabase = createClient();

  try {
    const authUser = await supabase.auth.getUser();
    const authUserId = authUser?.data?.user?.id;

    if (!authUserId) {
      throw "No authenticated user";
    }

    const result = await supabase
      .from("users")
      .select("*")
      .eq("id", authUserId)
      .single();

    return result;
  } catch (error) {
    logger.error(error);

    throw error;
  }
}

export async function getCases() {
  const supabase = createClient();
  return unstable_cache(
    async () => {
      try {
        const result = await supabase.from("cases").select("*");
        return result;
      } catch (error) {
        logger.error(error);
        throw error;
      }
    },
    ["cases"],
    {
      tags: ["cases"],
      revalidate: 100,
    },
  )();
}

export async function getCaseById(id: string) {
  const supabase = createClient();
  return unstable_cache(
    async () => {
      const result = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();
      return result;
    },
    ["cases", id],
    {
      tags: ["cases", id],
      revalidate: 100,
    },
  )();
}

export async function getUsers() {
  const supabase = createClient();
  console.log("fetching users");
  return unstable_cache(
    async () => {
      try {
        const result = await supabase.from("users").select("*");
        return result;
      } catch (error) {
        logger.error(error);
        throw error;
      }
    },
    ["users"],
    {
      tags: ["users"],
      revalidate: 100,
    },
  )();
}

export async function getMembers() {
  const supabase = createClient();
  console.log("fetching members");
  return unstable_cache(
    async () => {
      try {
        const result = await supabase.from("members").select("*");
        return result;
      } catch (error) {
        logger.error(error);
        throw error;
      }
    },
    ["members"],
    {
      tags: ["members"],
      revalidate: 100,
    },
  )();
}
