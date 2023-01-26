import { useSupabase } from "~/hooks/useSupabase";
import type { Database } from "~/types/database";
import { useEffect, useState } from "react";

//buscamos el tipo mensaje en nuestra tabla de mensajes
type Message = Database["public"]["Tables"]["messages"]["Row"];

export function RealTimeMessages({
  serverMessages,
}: {
  serverMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(serverMessages);
  const supabase = useSupabase();

  useEffect(() => {
    //canal que estaremos escuchando
    const channel = supabase
      .channel("*") //todos los canales
      .on(
        "postgres_changes", //cada vez que la tabla cambie
        { event: "INSERT", schema: "public", table: "messages" }, //escuchamos el evento INSERT
        (payload) => {
          //payload.new contiene el nuevo mensaje
          const newMessage = payload.new as Message;
          setMessages((messages) => [...messages, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return <pre>{JSON.stringify(messages, null, 2)}</pre>;
}
