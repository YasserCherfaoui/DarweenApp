import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSendEmail } from '@/hooks/queries/use-emails'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react'

const emailSchema = z.object({
  to: z.string().min(1, 'At least one recipient is required').refine(
    (val) => {
      const emails = val.split(',').map((e) => e.trim())
      return emails.every((email) => z.string().email().safeParse(email).success)
    },
    { message: 'All recipients must be valid email addresses' }
  ),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().optional(),
  is_html: z.boolean(),
})

type EmailFormValues = z.infer<typeof emailSchema>

interface EmailComposerProps {
  companyId: number
  onSuccess?: () => void
}

export function EmailComposer({ companyId, onSuccess }: EmailComposerProps) {
  const [showPreview, setShowPreview] = useState(false)
  const sendEmailMutation = useSendEmail(companyId)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write your email content here...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      to: '',
      subject: '',
      body: '',
      is_html: true,
    },
  })

  const prefillWithMockData = () => {
    if (!editor) {
      return
    }

    const mockData = {
      to: 'recipient@example.com, another@example.com',
      subject: 'Sample Email Subject - Test Message',
      body: `
        <h2>Hello!</h2>
        <p>This is a <strong>sample email</strong> with mock data.</p>
        <p>You can use this to test your email composition and formatting.</p>
        <ul>
          <li>This is a bullet point</li>
          <li>Another bullet point</li>
          <li>And one more</li>
        </ul>
        <p>Feel free to <em>edit</em> this content as needed.</p>
        <p>Best regards,<br/>Your Team</p>
      `.trim(),
    }

    form.setValue('to', mockData.to)
    form.setValue('subject', mockData.subject)
    form.setValue('is_html', true)
    editor.commands.setContent(mockData.body)
  }

  const onSubmit = async (values: EmailFormValues) => {
    if (!editor) {
      return
    }

    const body = editor.getHTML() || values.body || ''

    // Validate that body is not empty
    if (!body || body.trim() === '' || body === '<p></p>') {
      form.setError('body', { message: 'Email body is required' })
      return
    }

    try {
      await sendEmailMutation.mutateAsync({
        to: values.to.split(',').map((e) => e.trim()),
        subject: values.subject,
        body: body,
        is_html: values.is_html,
      })
      form.reset()
      editor.commands.clearContent()
      onSuccess?.()
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  if (!editor) {
    return <div>Loading editor...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To (comma-separated emails)</FormLabel>
              <FormControl>
                <Input
                  placeholder="user@example.com, another@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Email subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_html"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">HTML Format</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Send email as HTML (rich text) or plain text
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={() => (
            <FormItem>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Body</FormLabel>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      disabled={!editor.can().chain().focus().toggleBold().run()}
                      className={editor.isActive('bold') ? 'bg-muted' : ''}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      disabled={!editor.can().chain().focus().toggleItalic().run()}
                      className={editor.isActive('italic') ? 'bg-muted' : ''}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      className={editor.isActive('bulletList') ? 'bg-muted' : ''}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      className={editor.isActive('orderedList') ? 'bg-muted' : ''}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBlockquote().run()}
                      className={editor.isActive('blockquote') ? 'bg-muted' : ''}
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().chain().focus().undo().run()}
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().chain().focus().redo().run()}
                    >
                      <Redo className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Tabs value={showPreview ? 'preview' : 'edit'} onValueChange={(v) => setShowPreview(v === 'preview')}>
                  <TabsList>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="mt-0">
                    <div className="border rounded-md min-h-[300px]">
                      <EditorContent editor={editor} />
                    </div>
                  </TabsContent>
                  <TabsContent value="preview" className="mt-0">
                    <div
                      className="border rounded-md p-4 min-h-[300px] prose prose-sm max-w-none overflow-auto"
                      dangerouslySetInnerHTML={{
                        __html: editor.getHTML() || '<p class="text-gray-400">No content yet...</p>',
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={prefillWithMockData}
          >
            Prefill with Mock Data
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset()
              editor.commands.clearContent()
            }}
          >
            Clear
          </Button>
          <Button
            type="submit"
            disabled={sendEmailMutation.isPending}
          >
            {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
