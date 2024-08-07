"use client";

import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Participant } from "@prisma/client";
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
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";

const formSchema = z.object({
  name: z.string().min(1),
  txtColor: z.string().min(1),
  bgColor: z.string().min(1)
})

type FormValues = z.infer<typeof formSchema>;

interface ParticipantFormProps {
  initialData: Participant | null;
}

export const ParticipantForm: React.FC<ParticipantFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      txtColor: '',
      bgColor: ''
    }
  });

  const title = initialData ? "Edit participant" : "Create participant";
  const description = initialData ? "Edit a participant" : "Create a participant";
  const toastMessage = initialData ? "Participant updated" : "Participant created";
  const action = initialData ? "Save changes" : "Create";


  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      if (initialData) {
        await axios.patch(`/api/participants/${params.participantId}`, data);
      } else {
        await axios.post('/api/participants', data);
      }
      
      router.refresh();
      router.push('/participants');
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
      await axios.delete(`/api/participants/${params.participantId}`);
      router.refresh();
      router.push('/participants');
      toast.success("Participant deleted.")
    } catch(error) {
      toast.error("Make sure you removed all medias using this participant first.");
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="Participant name" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-8">
              <FormField 
                control={form.control}
                name="txtColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-x-4">
                        <Input disabled={loading} placeholder="#121212" {...field}/>
                        <div 
                          className="border p-4 rounded-full" style={{ backgroundColor: field.value }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="bgColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-x-4">
                        <Input disabled={loading} placeholder="#ffffff" {...field}/>
                        <div 
                          className="border p-4 rounded-full" style={{ backgroundColor: field.value }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button disabled={loading} className="ml-auto" type="submit">
              {action}
            </Button>
          </form>
        </Form>
        <Separator />
    </>
  )
}