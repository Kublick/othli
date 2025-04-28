import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface ConfirmationEmailProps {
  name: string;
  confirmationUrl: string;
}

const EmailConfirmation = ({
  name,
  confirmationUrl,
}: ConfirmationEmailProps) => {
  return (
    <Html>
      <Tailwind>
        <Head>
          <title>Confirm Your Email Address</title>
        </Head>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] mx-auto p-[20px] max-w-[600px]">
            <Heading className="text-[24px] font-bold text-gray-800 mt-[10px] mb-[24px]">
              Welcome, {name}!
            </Heading>
            <Text className="text-[16px] leading-[24px] text-gray-600 mb-[12px]">
              Thank you for registering with us. We're excited to have you on
              board!
            </Text>
            <Text className="text-[16px] leading-[24px] text-gray-600 mb-[24px]">
              To complete your registration and verify your account, please
              click the button below:
            </Text>
            <Section className="text-center mb-[32px]">
              <Button
                className="bg-blue-600 text-white font-bold py-[12px] px-[24px] rounded-[4px] no-underline text-center box-border"
                href={confirmationUrl}
              >
                Confirm Email Address
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-gray-600 mb-[12px]">
              If you did not create an account, you can safely ignore this
              email.
            </Text>
            <Text className="text-[14px] leading-[24px] text-gray-600 mb-[24px]">
              This confirmation link will expire in 24 hours.
            </Text>
            <Text className="text-[14px] leading-[24px] text-gray-600 mb-[12px]">
              If the button above doesn't work, copy and paste the following
              link into your browser:
            </Text>
            <Text className="text-[14px] leading-[24px] text-gray-600 mb-[24px] break-all">
              <Link href={confirmationUrl} className="text-blue-600 underline">
                {confirmationUrl}
              </Link>
            </Text>
            <Hr className="border-gray-200 my-[24px]" />
            <Text className="text-[12px] leading-[16px] text-gray-500 mb-[12px]">
              Si tienes preguntas, contacta al equipo de soporte
            </Text>
            <Text className="text-[12px] leading-[16px] text-gray-500 m-0">
              © {new Date().getFullYear()} OhtliFinanzas . Todos los derechos
              reservados.
            </Text>
            <Text className="text-[12px] leading-[16px] text-gray-500 m-0">
              Mexico
            </Text>
            <Text className="text-[12px] leading-[16px] text-gray-500 m-0">
              <Link href="#" className="text-gray-500 underline">
                Unsubscribe
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailConfirmation;
