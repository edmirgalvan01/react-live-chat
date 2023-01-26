import { createSupabaseServerClient } from "~/utils/supabase.server";
import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Login } from "~/components/Login";
import { json } from "@remix-run/node";
import { RealTimeMessages } from "~/components/RealTimeMessages";

// loader de datos en el SERVER
export const loader = async ({ request }: LoaderArgs) => {
  const response = new Response();
  const supabase = createSupabaseServerClient({ request, response });

  //traemos mensajes desde la BBDD
  const { data } = await supabase.from("messages").select();

  //retornamos messages y headers
  return json({ messages: data ?? [] }, { headers: response.headers });
};

//funcion que se ejecuta al hacer submit
export const action = async ({ request }: ActionArgs) => {
  const response = new Response();
  const supabase = createSupabaseServerClient({ request, response });

  //formData capturado desde la request
  const formData = await request.formData();

  //valores del formulario
  const { message } = Object.fromEntries(formData);

  //guardar en supabase
  await supabase.from("messages").insert({ content: String(message) });

  return json({ message: "ok" }, { headers: response.headers });
};

export default function Index() {
  const { messages } = useLoaderData<typeof loader>();
  return (
    <main>
      <h1>ChatLive</h1>
      <Login />
      <Form method="post">
        <input type="text" name="message" />
        <button type="submit">Enviar mensaje</button>
      </Form>
      <RealTimeMessages serverMessages={messages} />
    </main>
  );
}
