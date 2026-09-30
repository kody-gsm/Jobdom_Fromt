import type { Metadata } from "next";
import { RoomPage } from "@fsd/pages/room";

export const metadata: Metadata = { title: "Room" };

export default function Page() {
  return <RoomPage />;
}
