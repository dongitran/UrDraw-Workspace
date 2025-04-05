"use client";

import { WorkspacePage } from "@/components/WorkspacePage";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Fragment } from "react";

dayjs.extend(advancedFormat);

export default function WorkspacePageV2() {
  return <Fragment> Helloe</Fragment>;
}
