"use client";

import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Media, Participant } from "@prisma/client";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";
import VideoUpload from "@/components/ui/video-upload";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  participantId: z.string().min(1),
  isNsfw: z.boolean().default(true).optional()
})

type FormValues = z.infer<typeof formSchema>;

interface MediaFormProps {
  initialData: Media | null;
  participants: Participant[];
}

export const MediaForm: React.FC<MediaFormProps> = ({
  initialData,
  participants
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      label: '',
      url: '',
      participantId: '',
      isNsfw: false 
    }
  });

  const title = initialData ? "Edit media" : "Create media";
  const description = initialData ? "Edit a media" : "Create a media";
  const toastMessage = initialData ? "Media updated" : "Media created";
  const action = initialData ? "Save changes" : "Create";


  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      if (initialData) {
        await axios.patch(`/api/medias/${params.mediaId}`, data);
      } else {
        await axios.post('/api/medias', data);
      }
      
      router.refresh();
      router.push('/medias');
      toast.success(toastMessage)
    } catch(error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/medias/${params.mediaId}`);
      router.refresh();
      router.push('/medias');
      toast.success("Media deleted.")
    } catch(error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <AlertModal 
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading 
          title={title}
          description={description}
        />
        
        {initialData && (
          <Button
          disabled={loading}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4"/>
          </Button>
        )}
        
      </div>
      <Separator />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
            <div className="grid grid-cols-3 gap-8">
              <FormField 
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="Media label" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField 
                control={form.control}
                name="participantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Participant</FormLabel>
                    <Select 
                      disabled={loading} 
                      onValueChange={field.onChange} 
                      value={field.value} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue 
                            defaultValue={field.value}
                            placeholder="Select a participant"
                          /> 
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {participants.map((participant) => (
                          <SelectItem 
                            key={participant.id}
                            value={participant.id}
                          >
                            {participant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-8">
              <FormField 
                  control={form.control}
                  name="isNsfw"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 ">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          NSFW
                        </FormLabel>
                        <FormDescription>
                          This media will not appear in home page.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

            <FormField 
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media</FormLabel>
                  <FormDescription>Tamanho máximo de 100 MB</FormDescription>
                  <FormControl> 
                    <VideoUpload
                      url={field.value}
                      disabled={loading}
                      onChange={(url) => field.onChange(url)}
                      onRemove={() => field.onChange()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={loading} className="ml-auto" type="submit">
              {action}
            </Button>
          </form>
        </Form>
        <Separator />
    </>
  )
}