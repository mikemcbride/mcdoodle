import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "@react-email/components";
import * as React from "react";

// TODO: this will send a verification email to the user.
// the page we send them to will POST to our API to update the user to be verified.
// we should prevent login until the user is verified.
export default function VerifyEmailTemplate({ email, firstName, token, baseUrl }: { email: string, firstName: string, token: string, baseUrl?: string }) {
  const base = baseUrl || 'http://localhost:5173';
  return (
    <Tailwind config={{ presets: [pixelBasedPreset] }}>
    <Html>
      <Head />
      <Preview>McDoodle - Verify Account</Preview>
      <Body>
        <Container className="font-sans px-4">
          <Section>
            <Text className="text-base mb-8">Hey there {firstName || 'Doodler'},</Text>
            <Text className="text-base mb-8">
              Thanks for registering. We need to verify your email account before we can let you log in (you understand, right?). Click the link below and you&apos;ll be on your way!
            </Text>
            <Button className="bg-blue-600 text-white px-8 py-2 text-sm text-center rounded-lg mb-4" href={`${base}/verify-account?token=${token}&action=verify&email=${email}`}>
              Verify Account
            </Button>
            <Text className="text-base mb-8">
              However, if you did <span className="font-bold">not</span> register for an account with us, please click &quot;Reject&quot; below to prevent your email being used for this account registration.
            </Text>
            <Button className="bg-red-100 text-red-600 px-8 py-2 text-sm text-center rounded-lg mb-4" href={`${base}/verify-account?token=${token}&email=${email}&action=reject`}>
              Reject Request
            </Button>
            <Text className="text-base mb-8">
              To keep your account secure, please do not forward this email
              to anyone.
            </Text>
            <Text className="text-base mb-8">Happy Doodling!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
    </Tailwind>
  )
}
