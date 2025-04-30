import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, ChatCircleText } from "@phosphor-icons/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Define the review interface to make the component more type-safe
interface MediaReview {
  user?: {
    username?: string;
    images?: {
      jpg?: {
        image_url?: string;
      };
    };
  };
  date?: string;
  score?: number;
  review?: string;
  is_spoiler?: boolean;
  tags?: string[];
}

interface MediaReviewsProps {
  title: string;
  reviews?: MediaReview[];
  isLoading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaReviews({
  title,
  reviews,
  isLoading = false,
  open,
  onOpenChange,
}: MediaReviewsProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ChatCircleText size={18} />
          Reviews
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Reviews for {title}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : reviews && reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 mx-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={review.user?.images?.jpg?.image_url} />
                    <AvatarFallback>
                      {review.user?.username?.substring(0, 2) || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{review.user?.username}</div>
                    <div className="text-xs text-muted-foreground">
                      {review.date
                        ? new Date(review.date).toLocaleDateString()
                        : "Unknown date"}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center">
                    <Star
                      className="text-yellow-500 mr-1"
                      size={16}
                      weight="fill"
                    />
                    <span>{review.score}</span>
                  </div>
                </div>

                {review.is_spoiler ? (
                  <div className="text-sm">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm">
                          Show Spoiler Review
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <p className="mt-2 text-sm whitespace-pre-line">
                          {review.review}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-line">
                    {review.review && review.review.length > 300
                      ? `${review.review.substring(0, 300)}...`
                      : review.review}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 pt-2">
                  {review.tags?.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No reviews available.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
