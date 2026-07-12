import type { Metadata } from "next";
import MasterProgramContent from "./MasterProgramContent";

export const metadata: Metadata = {
  title: "Master Data Program",
};

export default function MasterProgramPage() {
  return <MasterProgramContent />;
}
