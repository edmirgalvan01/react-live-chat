import type { MetaFunction, LoaderArgs } from "@remix-run/node";
import { createBrowserClient } from "@supabase/auth-helpers-remix";
import { json } from "@remix-run/node";
import type { Database } from "./types/database";
import styles from "./styles/global.css";
import { useEffect, useState } from "react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import { createSupabaseServerClient } from "./utils/supabase.server";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "LiveChat",
  viewport: "width=device-width,initial-scale=1",
});

export const links = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }: LoaderArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  const response = new Response();

  const supabase = createSupabaseServerClient({ request, response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return json({ env, session }, { headers: response.headers });
};

export default function App() {
  const { env, session: serverSession } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const [supabase] = useState(() =>
    createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      //si la sesion actual no es la misma que la pasada
      if (session?.access_token !== serverSession?.access_token) {
        //revalida los datos (recarga la informacion)
        revalidator.revalidate();
      }
    });

    //limpiamos las subscripciones
    return () => subscription.unsubscribe();
  }, []);

  return (
    <html lang="es">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={{ supabase }} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
