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

export default function ForgotPasswordTemplate({
  user,
}: { user: { firstName: string } }) {
  return (
    <Tailwind config={{ presets: [pixelBasedPreset] }}>
      <Html>
        <Head />
        <Preview>McDoodle - Forgot Password</Preview>
        <Body>
          <Container className="font-sans px-4">
            <Section>
              <Text className="text-base mb-8">Hey there {user?.firstName},</Text>
              <Text className="text-base mb-8">
                Someone recently requested a password change for your McDoodle
                account. If this was you, you can set a new password here:
              </Text>
              <Button className="bg-blue-600 text-white px-8 py-2 text-sm text-center rounded-lg mb-4">
                Reset Password
              </Button>
              <Text className="text-base mb-8">
                If you do not want to change your password or did not
                request this, you delete this message and trust that your account will remain untouched.
              </Text>
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
  );
};

