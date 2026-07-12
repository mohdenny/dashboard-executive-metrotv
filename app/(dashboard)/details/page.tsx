import type { Metadata } from "next";
import DetailsContent from "./DetailsContent";

export const metadata: Metadata = {
  title: "Details",
};

export default function MasterProgramPage() {
  return <DetailsContent />;
}
