import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Home() {
  return (
    <div className="justify-center items-center flex flex-col h-screen">
      <h1>Test</h1>
      <Button> Click me</Button>
      <ModeToggle />
    </div>
  );
}
