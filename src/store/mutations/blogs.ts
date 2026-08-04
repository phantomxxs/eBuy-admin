import { useMutation, useQueryClient } from "@tanstack/react-query"
import { showAlert } from "@/store/alerts"
import { archiveBlog, createBlog, deleteBlog, publishBlog, updateBlog } from "../requests/blogs"
import { GET_BLOGS_KEY, GET_BLOG_BY_ID_KEY, GET_BLOG_METRICS_KEY } from "../query-keys"

export const useCreateBlog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [GET_BLOGS_KEY] })
      void qc.invalidateQueries({ queryKey: [GET_BLOG_METRICS_KEY] })
      showAlert({ variant: "success", message: "Blog post created successfully" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useUpdateBlog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateBlog>[1] }) =>
      updateBlog(id, payload),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: [GET_BLOGS_KEY] })
      void qc.invalidateQueries({ queryKey: [GET_BLOG_BY_ID_KEY, id] })
      showAlert({ variant: "success", message: "Blog post updated successfully" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const usePublishBlog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => publishBlog(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: [GET_BLOGS_KEY] })
      void qc.invalidateQueries({ queryKey: [GET_BLOG_BY_ID_KEY, id] })
      void qc.invalidateQueries({ queryKey: [GET_BLOG_METRICS_KEY] })
      showAlert({ variant: "success", message: "Blog published" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useArchiveBlog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => archiveBlog(id),
    onSuccess: (_, id) => {
      void qc.invalidateQueries({ queryKey: [GET_BLOGS_KEY] })
      void qc.invalidateQueries({ queryKey: [GET_BLOG_BY_ID_KEY, id] })
      void qc.invalidateQueries({ queryKey: [GET_BLOG_METRICS_KEY] })
      showAlert({ variant: "success", message: "Blog archived" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}

export const useDeleteBlog = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [GET_BLOGS_KEY] })
      void qc.invalidateQueries({ queryKey: [GET_BLOG_METRICS_KEY] })
      showAlert({ variant: "success", message: "Blog post deleted" })
    },
    onError: (error: Error) => showAlert({ variant: "error", message: error.message }),
  })
}
