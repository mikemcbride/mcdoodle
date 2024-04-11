import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from 'react';

// TODO: this will send a verification email to the user.
// the page we send them to will POST to our API to update the user to be verified.
// we should prevent login until the user is verified.
export const VerifyEmailTemplate = ({ email, firstName, lastName, token }) => {
  return (
    <Html>
      <Head />
      <Preview>McDoodle - Verify Account</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section>
            <Text style={styles.text}>Hi {firstName},</Text>
            <Text style={styles.text}>
              Thanks for registering. We need to verify your email account before we can let you log in (you understand, right?). Click the link below and you&apos;ll be on your way!
            </Text>
            <Button style={styles.button} href={`${process.env.NEXT_PUBLIC_BASE_URL}/verify-account?token=${token}&action=verify&email=${email}`}>
              Verify Account
            </Button>
            <Text style={styles.text}>
              If you did not register for an account, please click &quot;Reject&quot; below to prevent your email being used for this account registration.
            </Text>
            <Button style={styles.button} href={`${process.env.NEXT_PUBLIC_BASE_URL}/verify-account?token=${token}&email=${email}&action=reject`}>
              Reject Request
            </Button>
            <Text style={styles.text}>
              To keep your account secure, please don&apos;t forward this email
              to anyone.
            </Text>
            <Text style={styles.text}>Happy Doodling!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const ForgotPasswordTemplate = ({
  token,
  user,
}) => {
  return (
    <Html>
      <Head />
      <Preview>McDoodle - Forgot Password</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section>
            <Text style={styles.text}>Hi {user.firstName},</Text>
            <Text style={styles.text}>
              Someone recently requested a password change for your McDoodle
              account. If this was you, you can set a new password here:
            </Text>
            <Button style={styles.button} href={`${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`}>
              Reset password
            </Button>
            <Text style={styles.text}>
              If you don&apos;t want to change your password or didn&apos;t
              request this, just ignore and delete this message.
            </Text>
            <Text style={styles.text}>
              To keep your account secure, please don&apos;t forward this email
              to anyone.
            </Text>
            <Text style={styles.text}>Happy Doodling!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};


const styles = {
  main: {
    backgroundColor: "#f3f4f6",
    padding: "10px 0",
  },

  container: {
    backgroundColor: "#ffffff",
    border: "1px solid #f0f0f0",
    padding: "45px",
  },

  text: {
    fontSize: "16px",
    fontFamily:
      "'Inter', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
    fontWeight: "400",
    color: "#404040",
    lineHeight: "26px",
  },

  button: {
    backgroundColor: "#2563eb",
    borderRadius: "4px",
    color: "#fff",
    fontFamily: "'Inter', 'Helvetica Neue', Arial",
    fontSize: "15px",
    textDecoration: "none",
    textAlign: "center",
    display: "block",
    width: "210px",
    padding: "14px 7px",
  }
}
