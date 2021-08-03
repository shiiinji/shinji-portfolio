import React from 'react'
import { useFormik } from 'formik'
import { useAnalytics, useUser } from 'reactfire'
import { useRouter } from 'next/router'
import { useSetRecoilState } from 'recoil'
import * as Yup from 'yup'
import { Box, Button, TextField } from '@material-ui/core'
import { ErrorTypography } from '@components/common/ErrorTypography'
import { SnackbarView } from '@components/common/Snackbar'
import { useNewCreateRef, createComment } from '@hooks/useComment'
import { snackbarState } from '@store/atoms/snackbar'

export const validationSchema = Yup.object().shape({
  content: Yup.string().max(1024).required('必須'),
})

export function CommentEditor() {
  const analytics = useAnalytics()
  const setSnackbar = useSetRecoilState(snackbarState)
  const router = useRouter()
  const { data: user } = useUser()
  const commentRef = useNewCreateRef(user.uid)

  const blogId = router.query.id as string

  const formik = useFormik({
    initialValues: {
      content: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        formik.setStatus(true)
        await createComment(values.content, commentRef, user, blogId)
        analytics.logEvent('add_comment', {
          blog_id: blogId,
          comment_id: commentRef.id,
        })
        setSnackbar((prevState) => ({
          ...prevState,
          isOpen: true,
          message: '投稿しました',
        }))
      } catch (err) {
        setSnackbar((prevState) => ({
          ...prevState,
          isOpen: true,
          message: err.message,
        }))
      }
    },
  })

  return (
    <>
      <SnackbarView />
      <form onSubmit={formik.handleSubmit}>
        <TextField
          name="content"
          label="コンテンツ"
          inputProps={{ 'data-testid': 'content-input' }}
          value={formik.values.content}
          disabled={formik.status}
          error={!!(formik.touched.content && formik.errors.content)}
          onChange={formik.handleChange}
          placeholder="記事についてコメントする"
          InputLabelProps={{ shrink: true }}
          fullWidth={true}
          margin="normal"
          multiline={true}
          rows={5}
          variant="outlined"
        />
        {formik.touched.content && formik.errors.content && (
          <ErrorTypography>{formik.errors.content}</ErrorTypography>
        )}
        <Box pt={2}>
          <Button
            color="primary"
            data-testid="submit"
            disabled={formik.status}
            type="submit"
            variant="outlined"
          >
            投稿する
          </Button>
        </Box>
      </form>
    </>
  )
}
