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
import { useQuery } from "@tanstack/react-query";
import { CollectionApi } from "@/lib/api";
import { renderMethod } from "@/helpers/renderElement";

const CollectionLog = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["systemlog" + id],
    queryFn: () => {
      return CollectionApi().getLogs(id);
    },
    enabled: id ? true : false,
  });

  if (isLoading || !data) {
    return null;
  }
  return (
    <Fragment>
      <div className="p-3 border rounded-sm">
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span>Total Drawing</span>
          <div className="ml-auto"></div>
          <Badge>{data.collection.totalDrawing}</Badge>
        </div>
        <div className="text-xl font-semibold mt-2 mb-2">{data.collection.name}</div>
        <div className="text-muted-foreground text-xs">
          <span>{dayjs(data.collection.createdAt).format("HH:mm DD/MM/YYYY")}</span>
          <span> - </span>
          <span>Trần Trung Hiếu</span>
        </div>
      </div>
      <Separator />

      {data.logs.map((item) => {
        return (
          <div className="border p-3 rounded-sm" key={item.id}>
            <div className="mb-3">{renderMethod(item.method)}</div>
            <div className="mb-3 text-sm font-medium">{item.description}</div>
            <div className="text-muted-foreground text-xs">
              <span>{dayjs(item.createdAt).format("HH:mm DD/MM/YYYY")}</span>
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
