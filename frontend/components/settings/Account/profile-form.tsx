'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfile } from '@/hooks/use-profile';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as Yup from 'yup';

const profileFormSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, 'Username must be at least 2 characters.')
    .max(30, 'Username must not be longer than 30 characters.')
    .required('Username is required.'),
  email: Yup.string().email('Invalid email format.').required('Email is required.'),
});

export function ProfileForm() {
  const { data: me, isLoading: meLoading, error: profileError } = useProfile();
  const [initialValues, setInitialValues] = useState({
    username: '',
    email: '',
    picture: '',
  });


  useEffect(() => {
    if (me) {
      setInitialValues({
        username: me.name || '',
        email: me.email || '',
        picture: me.picture || '',
      });
    }
  }, [me]);

  const handleSubmit = (values) => {
   toast.success('Profile updated successfully.');
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={profileFormSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}>
      {({ isSubmitting }) => (
        <Form className="space-y-4 w-full md:max-w-[50%]">
          <div className="flex gap-4 items-center">
            <Avatar>
              <AvatarImage src={initialValues.picture} alt="@shadcn" />
              <AvatarFallback>{initialValues.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold">{initialValues.username}</span>
              <span className="text-xs text-muted-foreground">{initialValues.email}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="username">Name</label>
            <Field name="username" as={Input} />
            <ErrorMessage name="username" component="div" className="text-red-500 text-sm" />
            <div className="text-sm text-muted-foreground">
              This is your public display name. You can change this at any time.
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email</label>
            <Field name="email" as={Input} disabled />
            <div className="text-sm text-muted-foreground">
              This is your registered email and cannot be changed. If you need to update this
              information, please contact our support team for assistance.
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            Update profile
          </Button>
        </Form>
      )}
    </Formik>
  );
}
