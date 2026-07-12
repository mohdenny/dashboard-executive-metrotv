import type { Metadata } from "next";
import CompareContent from "./CompareContent";

export const metadata: Metadata = {
  title: "Compare",
};

export default function MasterProgramPage() {
  return <CompareContent />;
}
