import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Fragment } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon } from "lucide-react";

const InvitationPage = async () => {
  return (
    <Fragment>
      <div className="grid grid-cols-1 gap-3">
        <div className="border p-3 rounded-sm text-sm">
          <div className="text-xs text-muted-foreground/50 font-semibold mb-2">
            {dayjs().format("HH:mm DD/MM/YYYY")} -{" "}
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="underline">tranhieu14310@gmail.com</span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/vercel.png" />
                    <AvatarFallback>VC</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">@nextjs</h4>
                    <p className="text-sm">The React Framework – created and maintained by @vercel.</p>
                    <div className="flex items-center pt-2">
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                      <span className="text-xs text-muted-foreground">Joined December 2021</span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          <div>
            Bạn nhận được lời mời tham gia từ <span className="underline">tranhieu@gmail.com</span>. Bạn có muốn tham
            gia không?
          </div>
          <div className="flex gap-3 mt-3">
            <Button size="sm" className="" variant="success">
              Đồng ý
            </Button>
            <Button size="sm" variant="destructive">
              Hủy
            </Button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default InvitationPage;
