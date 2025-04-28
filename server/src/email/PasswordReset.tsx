import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface ConfirmationEmailProps {
  name: string;
  url: string;
}

const PasswordReset = ({ name, url }: ConfirmationEmailProps) => {
  return (
    <Html>
      <Tailwind>
        <Head>
          <title>Restablecer contraseña</title>
          <Preview>Solicitud de restablecimiento de contraseña</Preview>
        </Head>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] mx-auto p-[20px] max-w-[600px]">
            <Heading className="text-[24px] font-bold text-center text-black my-[30px]">
              Hola {name},
            </Heading>

            <Text className="text-[16px] leading-[24px] text-gray-700 mb-[12px]">
              Recibimos una solicitud para restablecer la contraseña de tu
              cuenta. Para continuar con este proceso, haz clic en el botón de
              abajo.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-blue-600 text-white font-bold py-[12px] px-[20px] rounded-[4px] no-underline text-center box-border"
                href={url}
              >
                Restablecer Contraseña
              </Button>
            </Section>

            <Text className="text-[16px] leading-[24px] text-gray-700 mb-[12px]">
              Si tú no solicitaste este cambio, puedes ignorar este correo y tu
              contraseña permanecerá sin cambios.
            </Text>

            <Text className="text-[16px] leading-[24px] text-gray-700 mb-[12px]">
              Este enlace expirará en 24 horas por razones de seguridad.
            </Text>

            <Text className="text-[16px] leading-[24px] text-gray-700 mb-[24px]">
              Gracias,
              <br />
              El Equipo de OthiliFin
            </Text>

            {/* <Hr className="border-gray-300 my-[24px]" />

            <Text className="text-[12px] leading-[16px] text-gray-500 m-0">
              © 2025 Tu Empresa. Todos los derechos reservados.
            </Text>
            <Text className="text-[12px] leading-[16px] text-gray-500 m-0">
              Av. Revolución 123, Col. Centro, Ciudad de México, CDMX, México
            </Text>
            <Text className="text-[12px] leading-[16px] text-gray-500 m-0">
              <a
                href="https://example.com/unsubscribe"
                className="text-blue-500 underline"
              >
                Cancelar suscripción
              </a>
            </Text> */}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PasswordReset;
