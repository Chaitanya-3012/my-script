"use client";
import { Button } from "@/components/ui/button";
import greet from "@/service/script";
export default function Page() {
  return (
    <div className="p-8 justify-center items-center flex h-screen w-full">
      <Button size="lg" onClick={() => console.log(greet("User"))}>
        Example
      </Button>
    </div>
  );
}
