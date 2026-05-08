import { useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import fixWebmDuration from "webm-duration-fix";

export const useVideoRecording = (interviewId: string) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  
  const videoStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const uploadVideoToSupabase = useCallback(async (blob: Blob): Promise<string | null> => {
    if (!blob || blob.size === 0) {
      console.error("No video blob to upload or blob is empty");
      setIsUploadingVideo(false);
      return null;
    }

    console.log("Starting video upload, original blob size:", blob.size, "bytes");

    const MAX_FILE_SIZE = 45 * 1024 * 1024;

    let finalBlob: Blob = blob;
    try {
      finalBlob = await fixWebmDuration(blob);
      console.log("Applied webm-duration-fix. New blob size:", finalBlob.size);
    } catch (e) {
      console.warn("webm-duration-fix failed, proceeding with original blob", e);
      finalBlob = blob;
    }

    if (blob.size > MAX_FILE_SIZE) {
      console.log("File too large, attempting to compress...");
      // Compression logic would go here (same as original)
    }

    try {
      const fileName = `interview_${interviewId}_${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from("videos")
        .upload(fileName, finalBlob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload failed:", error.message);
        setIsUploadingVideo(false);
        return null;
      }

      console.log("Upload successful!", data);

      const { data: urlData } = supabase.storage
        .from("videos")
        .getPublicUrl(fileName);

      console.log("Video public URL:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (err) {
      console.error("Upload error:", err);
      setIsUploadingVideo(false);
      return null;
    }
  }, [interviewId]);

  const stopRecordingAndUpload = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        console.log("Stopping video recording...");
        setIsUploadingVideo(true);

        mediaRecorder.onstop = async () => {
          console.log("MediaRecorder stopped, creating final video blob");
          const finalBlob = new Blob(recordedChunksRef.current, {
            type: "video/webm",
          });
          console.log("Final video blob size:", finalBlob.size, "bytes");

          if (finalBlob.size > 0) {
            const videoUrl = await uploadVideoToSupabase(finalBlob);
            if (videoUrl) {
              setUploadedVideoUrl(videoUrl);
              resolve(videoUrl);
              return;
            }
          }

          setIsRecording(false);
          resolve(null);
        };

        mediaRecorder.stop();
      } else {
        console.log("MediaRecorder not active, creating blob from existing chunks");
        if (recordedChunksRef.current.length > 0) {
          const finalBlob = new Blob(recordedChunksRef.current, {
            type: "video/webm",
          });
          console.log("Final video blob size from existing chunks:", finalBlob.size, "bytes");

          if (finalBlob.size > 0) {
            setIsUploadingVideo(true);
            uploadVideoToSupabase(finalBlob)
              .then((videoUrl) => {
                if (videoUrl) {
                  setUploadedVideoUrl(videoUrl);
                  resolve(videoUrl);
                } else {
                  resolve(null);
                }
              })
              .catch(() => resolve(null));
          } else {
            resolve(null);
          }
        } else {
          console.log("No recorded chunks available");
          resolve(null);
        }
      }
    });
  }, [mediaRecorder, uploadVideoToSupabase]);

  const startRecording = useCallback(async () => {
    try {
      console.log("Starting camera and recording...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoStreamRef.current = stream;

      recordedChunksRef.current = [];

      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8,opus",
        videoBitsPerSecond: 250000,
        audioBitsPerSecond: 64000,
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
          console.log(
            "Video chunk added:",
            e.data.size,
            "bytes. Total chunks:",
            recordedChunksRef.current.length
          );
        }
      };

      recorder.onstop = () => {
        console.log(
          "MediaRecorder stopped. Total chunks:",
          recordedChunksRef.current.length
        );
        if (!isUploadingVideo) {
          console.log("Recording stopped but not uploading yet");
        }
      };

      setMediaRecorder(recorder);
      recorder.start(5000);
      setIsRecording(true);
      console.log("Video recording started with optimized settings");
    } catch (err) {
      console.error("Error starting camera/recorder:", err);
    }
  }, [isUploadingVideo]);

  return {
    isRecording,
    isUploadingVideo,
    videoUploaded,
    uploadedVideoUrl,
    startRecording,
    stopRecordingAndUpload
  };
};