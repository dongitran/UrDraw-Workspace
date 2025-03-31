"use client";

import { WorkspacePage } from "@/components/WorkspacePage";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);

export default function WorkspacePageV2() {
  return <WorkspacePage />;
}
