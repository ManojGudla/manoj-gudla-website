"use client";
import { useState } from "react";
import { addProjectImage } from "@/lib/admin/actions/content";
import { MediaPicker } from "./MediaPicker";

export function AddScreenshot({ projectId }: { projectId: string }) {
  const [key, setKey] = useState(0);
  return (
    <form
      action={async (fd) => {
        if (!fd.get("media_id")) return;
        await addProjectImage(fd);
        setKey((k) => k + 1);
      }}
      style={{ display: "grid", gap: "0.75rem" }}
    >
      <input type="hidden" name="project_id" value={projectId} />
      <MediaPicker key={key} name="media_id" label="Add a screenshot" initial={null} category="project" />
      <div>
        <button className="btn btn--sm">Add to project</button>
      </div>
    </form>
  );
}
