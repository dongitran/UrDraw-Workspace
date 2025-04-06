"use client";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { Fragment } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";

const CollectionLog = () => {
  const { id } = useParams();
  console.log("id :>> ", id);
  return (
    <Fragment>
      <div className="p-3 border rounded-sm">
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span>Total Drawing</span>
          <div className="ml-auto"></div>
          <Badge>0</Badge>
        </div>
        <div className="text-xl font-semibold mt-2 mb-2">dkqjwdhjkqwh dklhqkl whqkldhqklwhd</div>
        <div className="text-muted-foreground text-xs">
          <span>{dayjs().format("HH:mm DD/MM/YYYY")}</span>
          <span> - </span>
          <span>Trần Trung Hiếu</span>
        </div>
      </div>
      <Separator />

      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => {
        return (
          <div className="border p-3 rounded-sm">
            <div className="text-sm font-medium">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab accusantium at veniam aperiam doloremque
              similique vitae modi sequi dignissimos perspiciatis rem accusamus distinctio officia, repellat optio atque
              possimus quo beatae.
            </div>
            <div className="mt-3 text-muted-foreground text-xs">
              <span>{dayjs().format("HH:mm DD/MM/YYYY")}</span>
              <span> - </span>
              <span>Trần Trung Hiếu</span>
            </div>
          </div>
        );
      })}

      <Pagination className="justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </Fragment>
  );
};
export default CollectionLog;
