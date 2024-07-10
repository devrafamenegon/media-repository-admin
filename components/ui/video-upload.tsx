"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash } from "lucide-react";
import { CldUploadWidget, CldVideoPlayer, CloudinaryUploadWidgetInfo } from "next-cloudinary"
import 'next-cloudinary/dist/cld-video-player.css'

import { Button } from "./button";

interface VideoUploadProps {
  disabled?: boolean;
  onChange: (url: string) => void;
  onRemove: (url: string) => void;
  url: string
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  url
}) => {
  const [isMounted, setIsMounted] = useState(false);

  const ref = useRef<any>();

  useEffect(() => {
    ref.current = onChange;
  }) 

  useEffect(() => {
    setIsMounted(true)
  }, []);

  if (!isMounted) return null;

  return (
    <div className="mb-4 flex items-center gap-4">
      {url && (
        <div className="relative w-[600px] h-[400px] rounded-md overflow-hidden">
          <div className="z-10 absolute top-2 right-2">
            <Button type="button" onClick={() => onRemove(url)} variant="destructive" size={"icon"}>
              <Trash className="h-4 w-4"/>
            </Button>
          </div>
          <CldVideoPlayer 
            src={url}
            width="600"
            height="400"
          />
        </div>
        )}
      <CldUploadWidget 
        uploadPreset="kk5kmrcm"
        onSuccess={(results) => {
          if (results.info) {
            const info = results.info as CloudinaryUploadWidgetInfo;
            ref.current(info.secure_url);
          }
        }}
      >
        {({ open }) => {
          const onClick = () => {
            open();
          }

          return (
            <Button
              type="button"
              disabled={disabled}
              variant="secondary"
              onClick={onClick}
            >
              <ImagePlus className="h-4 w-4 mr-2"/>
              Upload a video
            </Button>
          )
        }}
      </CldUploadWidget>
    </div>
  )
}

export default VideoUpload;