"use client";

import { verifyOtpAction } from "@/actions/verify-otp-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@v1/supabase/client";
import { cn } from "@v1/ui";
import { Button } from "@v1/ui/button";
import { Form, FormControl, FormField, FormItem } from "@v1/ui/form";
import { Input } from "@v1/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@v1/ui/input-otp";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  value: z.string().min(1),
});

type Props = {
  className?: string;
};

export function OTPSignIn({ className }: Props) {
  const verifyOtp = useAction(verifyOtpAction);
  const [isLoading, setLoading] = useState(false);
  const [isSent, setSent] = useState(false);
  const [email, setEmail] = useState<string>("");
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  });

  const otpSlots = Array.from({ length: 6 }, (_, index) => ({
    id: `otp-slot-${index}`,
    index,
  }));

  async function onSubmit({ value }: z.infer<typeof formSchema>) {
    setLoading(true);
    setEmail(value);

    await supabase.auth.signInWithOtp({ email: value });

    setSent(true);
    setLoading(false);
  }

  async function onComplete(token: string) {
    verifyOtp.execute({
      token,
      email,
    });
  }

  if (isSent) {
    return (
      <div className={cn("flex flex-col space-y-4 items-center", className)}>
        <InputOTP
          maxLength={6}
          onComplete={onComplete}
          disabled={verifyOtp.status === "executing"}
        >
          <InputOTPGroup>
            {otpSlots.map((slot) => (
              <InputOTPSlot key={slot.id} index={slot.index} />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <button
          onClick={() => setSent(false)}
          type="button"
          className="text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className={cn("flex flex-col space-y-4", className)}>
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter email"
                    {...field}
                    autoCapitalize="false"
                    autoCorrect="false"
                    spellCheck="false"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="active:scale-[0.98] bg-primary px-6 py-4 text-secondary font-medium flex space-x-2 h-[40px] w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Continue</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
