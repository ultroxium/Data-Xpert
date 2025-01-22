'use client';
import { useProfile } from '@/hooks/use-profile';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useFormik } from 'formik';
import { EllipsisVertical, Loader2, PlusCircle } from 'lucide-react';
import * as Yup from 'yup';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import SearchParam from '@/lib/search-param';
import { ConfirmationAlert } from '../common/confirmation-alert';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const addTeamMember = async (data: any) => {
  const response = await axios.post('/api/invite?type=invite', data);
  return response.data;
};

const deleteMember = async (id: string) => {
  const response = await axios.delete(`/api/invite?id=${id}`);
  return response.data;
};

const updateRoles = async (id: string, data: any) => {
  const response = await axios.put(`/api/invite?id=${id}&type=roles`, data);
  return response.data;
};

const InvitePopover =({ data })=> {
  const workspace_id = SearchParam('wid');
  const queryClient = useQueryClient();
  const { data: me, isLoading: meLoading, error: profileError } = useProfile();

  const addMemberMutation = useMutation({
    mutationFn: ({ data }: { data: any }) => addTeamMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace_id] });
      toast.success('Invitation sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace_id] });
      toast.success('Member removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  const updateRolesMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateRoles(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace_id] });
      toast.success('Role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  const role = data?.teams[0]?.members?.find((member) => member?.email === me?.email)?.roles?.name;

  const formik = useFormik({
    initialValues: {
      email: '',
      permission: 'view',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
    }),
    onSubmit: async (values) => {
      await addMemberMutation.mutateAsync({
        data: {
          email: values.email,
          team_id: data?.teams[0]?.id,
          role_id: values.permission === 'edit' ? 2 : 3,
          workspace_id: data?.teams[0]?.workspace_id,
        },
      });
    },
  });

  return (
    <Popover >
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 px-2 lg:px-3">
          <div className="flex -space-x-2 overflow-hidden mr-1 lg:mr-2">
            {data?.teams[0]?.members.slice(0, 3).map((member, index) => (
              <Avatar key={index} className="inline-block border-2 border-background w-8 h-8">
                <AvatarImage src={member?.user_obj?.picture} alt={member?.name} />
                <AvatarFallback>{member?.user_obj?.name.charAt(0).toUpperCase() || 'G'}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <PlusCircle className="h-4 w-4 lg:h-5 lg:w-5" />
          <span className="sr-only lg:not-sr-only text-blue-400">Invite</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full' align='end'>
        <div>
          <CardHeader className="py-2">
            <CardTitle className="text-green-600/90 text-16">{data?.name}</CardTitle>
            <CardDescription className='text-14'>Anyone in the team can view this workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {role === 'Owner' && (
              <form onSubmit={formik.handleSubmit}>
                <div className="flex gap-2 items-center">
                  <Label htmlFor="email" className="sr-only">
                    Email
                  </Label>
                  <div className="relative rounded-md w-full shadow-sm flex gap-1 item-center ">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="E-mail"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    <Select
                      defaultValue={formik.values.permission}
                      onValueChange={(value) => formik.setFieldValue('permission', value)}>
                      <SelectTrigger className="w-[80px] " aria-label="Edit">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="edit">Edit</SelectItem>
                        <SelectItem value="view">View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="default"
                    type="submit"
                    className="shrink-0"
                    disabled={!formik.isValid || formik.isSubmitting}>
                    {addMemberMutation.isPending ? <Loader2 className="animate-spin" /> : 'Invite'}
                  </Button>
                </div>
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-500 text-12 mt-2">{formik.errors.email}</div>
                ) : null}
              </form>
            )}
            <Separator className="my-4" />
            <div className="space-y-4">
              <h4 className="text-12 font-medium">People with access</h4>

              <div className="grid gap-6">
                {data?.teams[0]?.members.map((member) => (
                  <div key={member?.id} className="flex md:items-center justify-between space-x-4 xxs:flex-col xxs:items-end md:flex-row">
                    <div className="flex items-center space-x-4 xxs:w-full md:w-fit">
                      <Avatar>
                        <AvatarImage src={member?.user_obj?.picture} alt="@shadcn" />
                        <AvatarFallback>
                          {member?.user_obj?.name.charAt(0).toUpperCase() || 'G'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-14 font-medium leading-none flex gap-2">
                          {member?.user_obj?.name || 'Guest'}
                          {member?.user_obj ? (
                            <span
                              className={`px-2 py-1 rounded-full text-10 ${member?.roles?.name === 'Owner'
                                  ? 'bg-green-300/70'
                                  : member?.roles?.name === 'Editor'
                                    ? 'bg-blue-300/70'
                                    : 'bg-red-300/70'
                                }`}>
                              {member?.roles?.name}
                            </span>
                          ) : (
                            <span className={`px-2 rounded-full text-10 ${'bg-yellow-300/70'}`}>
                              Pending
                            </span>
                          )}
                        </p>
                        <p className="text-12 text-muted-foreground">
                          {member?.user_obj?.email || member?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        defaultValue={member?.role_id === 1 || member?.role_id === 2 ? 'edit' : 'view'}
                        disabled={member?.roles?.name === 'Owner' || role !== 'Owner'}
                        onValueChange={async (values) => {
                          await updateRolesMutation.mutateAsync({
                            id: member?.id,
                            data: {
                              role_id: values === 'edit' ? 2 : 3,
                            },
                          });
                        }}>
                        <SelectTrigger className="ml-auto w-[110px]" aria-label="Edit">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className='text-12'>
                          <SelectItem value="edit">Can edit</SelectItem>
                          <SelectItem value="view">Can view</SelectItem>
                        </SelectContent>
                      </Select>

                      <DropdownMenu>
                        {' '}
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant={'ghost'}
                            className="py-0 px-2"
                            disabled={member?.roles?.name === 'Owner' || role !== 'Owner'}>
                            <EllipsisVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="flex flex-col">
                          <ConfirmationAlert
                            handleConfirm={async () => {
                              await deleteMemberMutation.mutateAsync(member?.id);
                            }}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </div>
      </PopoverContent>
    </Popover>
  );
}


export default InvitePopover;