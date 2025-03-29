import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Building2, 
  CreditCard, 
  Receipt, 
  Users, 
  Lock, 
  Edit, 
  Upload, 
  LogOut,
  UserCircle,
  MapPin,
  Phone,
  Mail,
  Building,
  FileText,
  Check,
  AlertCircle,
  ArrowUpDown
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Company info state
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyRegNumber, setCompanyRegNumber] = useState('');

  // Profile photo
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  // Form refs for profile data
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);

  // Company details
  const [companyEditMode, setCompanyEditMode] = useState(false);
  const companyNameRef = useRef<HTMLInputElement>(null);
  const companyRegNumberRef = useRef<HTMLInputElement>(null);
  const companyEmailRef = useRef<HTMLInputElement>(null);
  const companyPhoneRef = useRef<HTMLInputElement>(null);
  const companyAddressRef = useRef<HTMLInputElement>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);

  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Get current user data
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/user'],
    retry: false
  });

  // Initialize profile photo based on user avatar
  useEffect(() => {
    if (user?.avatar) {
      // This is just for UI display, we're not actually loading the file
      // In a real implementation, you'd handle this differently
      setProfilePhoto(null);
    }
  }, [user?.avatar]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await apiRequest('PATCH', '/api/users/profile', profileData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setEditMode(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
      console.error("Error updating profile:", error);
    }
  });

  // Upload profile photo mutation
  const uploadProfilePhotoMutation = useMutation({
    mutationFn: async (photoFile: File) => {
      // Convert file to base64 data URL
      return new Promise<any>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(photoFile);
        reader.onload = async () => {
          try {
            // Create an image element to compress
            const img = new Image();
            img.src = reader.result as string;
            await new Promise(resolve => img.onload = resolve);

            // Create canvas for compression
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set max dimensions
            const maxWidth = 800;
            const maxHeight = 800;
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }

            // Set canvas dimensions and draw image
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);

            // Get compressed image URL
            const imageUrl = canvas.toDataURL('image/jpeg', 0.7);
            console.log("Converting image to data URL");

            // Send the image URL to the server
            const response = await fetch('/api/users/avatar', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ imageUrl }),
              credentials: 'include'
            });

            if (!response.ok) {
              throw new Error('Failed to upload profile photo');
            }

            resolve(await response.json());
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = (error) => {
          reject(error);
        };
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully.",
      });
      setProfilePhoto(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error) => {
      console.error("Error uploading profile photo:", error);
      toast({
        title: "Failed to update profile photo",
        description: "There was an error uploading your profile photo. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: any) => {
      const response = await apiRequest('PATCH', '/api/users/password', passwordData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
      setPasswordDialogOpen(false);
      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    },
    onError: (error: any) => {
      // Try to extract error message from the response
      if (error.response) {
        error.response.json().then((data: any) => {
          setPasswordError(data.message || "Failed to change password");
        }).catch(() => {
          setPasswordError("Failed to change password");
        });
      } else {
        setPasswordError("Failed to change password");
      }
    }
  });

  // Save company info mutation
  const saveCompanyInfoMutation = useMutation({
    mutationFn: async (companyData: any) => {
      const response = await apiRequest('POST', '/api/company/info', companyData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Company information saved",
        description: "Your company information has been saved successfully.",
      });
      setCompanyEditMode(false);

      // If there's a logo file, upload it separately
      if (companyLogo) {
        uploadCompanyLogoMutation.mutate(companyLogo);
      }
    },
    onError: () => {
      toast({
        title: "Failed to save company information",
        description: "There was an error saving your company information. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Upload company logo mutation
  const uploadCompanyLogoMutation = useMutation({
    mutationFn: async (logoFile: File) => {
      // Convert file to base64 data URL
      return new Promise<any>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(logoFile);
        reader.onload = async () => {
          try {
            const imageUrl = reader.result as string;
            console.log("Converting company logo to data URL");

            // Send the image URL to the server
            const response = await fetch('/api/company/logo', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ imageUrl }),
              credentials: 'include'
            });

            if (!response.ok) {
              throw new Error('Failed to upload company logo');
            }

            resolve(await response.json());
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = (error) => {
          reject(error);
        };
      });
    },
    onSuccess: () => {
      toast({
        title: "Logo uploaded",
        description: "Your company logo has been uploaded successfully.",
      });
      setCompanyLogo(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error) => {
      console.error("Error uploading company logo:", error);
      toast({
        title: "Failed to upload logo",
        description: "There was an error uploading your company logo. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      // Clear React Query cache
      queryClient.clear();

      // Redirect to login page
      setLocation('/');

      toast({
        title: "Logged out",
        description: "You have been logged out successfully."
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Failed to log out",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle profile edit mode toggle
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  // Handle saving profile changes
  const handleSaveProfile = () => {
    const profileData = {
      name: nameRef.current?.value,
      email: emailRef.current?.value,
      phone: phoneRef.current?.value,
      location: locationRef.current?.value
    };

    updateProfileMutation.mutate(profileData);

    // If there's a profile photo, upload it
    if (profilePhoto) {
      uploadProfilePhotoMutation.mutate(profilePhoto);
    }
  };

  // Handle profile photo selection
  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProfilePhoto(event.target.files[0]);
    }
  };

  // Handle triggering profile photo upload dialog
  const handleProfilePhotoUploadClick = () => {
    profilePhotoInputRef.current?.click();
  };

  // Handle password change
  const handleChangePassword = () => {
    // Reset error
    setPasswordError("");

    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    // Submit password change
    changePasswordMutation.mutate({
      currentPassword,
      newPassword
    });
  };

  // Toggle company edit mode
  const toggleCompanyEditMode = () => {
    setCompanyEditMode(!companyEditMode);
  };

  // Handle saving company info
  const handleSaveCompanyInfo = () => {
    const companyData = {
      name: companyNameRef.current?.value,
      email: companyEmailRef.current?.value,
      phone: companyPhoneRef.current?.value,
      address: companyAddressRef.current?.value,
      registrationNumber: companyRegNumberRef.current?.value
    };

    setCompanyName(companyData.name || '');
    setCompanyEmail(companyData.email || '');
    setCompanyPhone(companyData.phone || '');
    setCompanyAddress(companyData.address || '');
    setCompanyRegNumber(companyData.registrationNumber || '');

    saveCompanyInfoMutation.mutate(companyData);
  };

  // Handle company logo selection
  const handleCompanyLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCompanyLogo(event.target.files[0]);
    }
  };

  // Handle triggering company logo upload dialog
  const handleCompanyLogoUploadClick = () => {
    companyLogoInputRef.current?.click();
  };

  // Generate user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <main className="w-full h-full overflow-y-auto bg-background pb-20">
      <div className="page-header mb-6">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-description">
          Manage your profile, company information, and payment settings
        </p>
      </div>

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full max-w-4xl">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center">
            <Building2 className="mr-2 h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-8 max-w-2xl">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-8 border-b border-border/40">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription className="mt-1">
                    Update your personal profile details and security settings
                  </CardDescription>
                </div>
                <Button 
                  variant={editMode ? "default" : "outline"}
                  onClick={editMode ? handleSaveProfile : toggleEditMode}
                  className="transition-all duration-300"
                >
                  {editMode ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Profile Photo Section */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center space-y-3">
                    {isLoadingUser ? (
                      <Skeleton className="h-24 w-24 rounded-full" />
                    ) : (
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                          <AvatarImage 
                            src={profilePhoto ? URL.createObjectURL(profilePhoto) : user?.avatar}
                            alt={user?.name || "User Profile"}
                          />
                          <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        {editMode && (
                          <div 
                            className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 cursor-pointer shadow-md hover:bg-primary/80 transition-colors"
                            onClick={handleProfilePhotoUploadClick}
                            title="Change profile photo"
                          >
                            <Upload className="h-4 w-4" />
                            <input
                              type="file"
                              ref={profilePhotoInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleProfilePhotoChange}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {editMode && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs"
                        onClick={handleProfilePhotoUploadClick}
                      >
                        Change Photo
                      </Button>
                    )}
                  </div>

                  {/* Profile Details */}
                  <div className="flex-1 space-y-4">
                    {/* Basic Info Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center text-sm font-medium">
                          <UserCircle className="mr-2 h-4 w-4 text-gray-500" />
                          Full Name
                        </Label>
                        {editMode ? (
                          <Input 
                            id="name" 
                            ref={nameRef}
                            defaultValue={user?.name || ""} 
                            placeholder="Enter your full name" 
                            className="border-gray-300 focus:border-primary"
                          />
                        ) : (
                          <div className="py-2 px-3 bg-muted/30 rounded-md text-foreground font-medium min-h-9">
                            {isLoadingUser ? <Skeleton className="h-5 w-full" /> : user?.name || "Not set"}
                          </div>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center text-sm font-medium">
                          <Mail className="mr-2 h-4 w-4 text-gray-500" />
                          Email Address
                        </Label>
                        {editMode ? (
                          <Input 
                            id="email"
                            ref={emailRef}
                            type="email" 
                            defaultValue={user?.email || ""} 
                            placeholder="Enter your email" 
                            className="border-gray-300 focus:border-primary"
                          />
                        ) : (
                          <div className="py-2 px-3 bg-muted/30 rounded-md text-foreground font-medium min-h-9">
                            {isLoadingUser ? <Skeleton className="h-5 w-full" /> : user?.email || "Not set"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Info Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center text-sm font-medium">
                          <Phone className="mr-2 h-4 w-4 text-gray-500" />
                          Phone Number
                        </Label>
                        {editMode ? (
                          <Input 
                            id="phone"
                            ref={phoneRef}
                            defaultValue={user?.phone || ""} 
                            placeholder="Enter your phone number" 
                            className="border-gray-300 focus:border-primary"
                          />
                        ) : (
                          <div className="py-2 px-3 bg-muted/30 rounded-md text-foreground font-medium min-h-9">
                            {isLoadingUser ? <Skeleton className="h-5 w-full" /> : user?.phone || "Not set"}
                          </div>
                        )}
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center text-sm font-medium">
                          <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                          Location
                        </Label>
                        {editMode ? (
                          <Input 
                            id="location"
                            ref={locationRef}
                            defaultValue={user?.location || ""} 
                            placeholder="City, Country" 
                            className="border-gray-300 focus:border-primary"
                          />
                        ) : (
                          <div className="py-2 px-3 bg-muted/30 rounded-md text-foreground font-medium min-h-9">
                            {isLoadingUser ? <Skeleton className="h-5 w-full" /> : user?.location || "Not set"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Account Security Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Security</h3>

                  {/* Password Section */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <h4 className="font-medium text-foreground flex items-center">
                          Password
                          {user?.lastPasswordChange && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Updated
                            </Badge>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {user?.lastPasswordChange 
                            ? `Last changed: ${user.lastPasswordChange}`
                            : "Secure your account with a strong password"}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-3 sm:mt-0 shadow-sm hover:shadow-md transition-all duration-300"
                        onClick={() => setPasswordDialogOpen(true)}
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                    </div>

                    {/* Sign Out Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <h4 className="font-medium text-foreground">Session</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          End your current session and log out
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-3 sm:mt-0 shadow-sm hover:shadow-md transition-all duration-300"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Dialog */}
          <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5 text-primary" />
                  Change Password
                </DialogTitle>
                <DialogDescription>
                  Update your password to secure your account.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {passwordError && (
                  <div className="p-3 text-sm bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200 rounded-md flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleChangePassword} 
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6 max-w-4xl">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-8 border-b border-border/40">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription className="mt-1">
                    Manage your company details and team members
                  </CardDescription>
                </div>
                <Button 
                  variant={companyEditMode ? "default" : "outline"}
                  onClick={companyEditMode ? handleSaveCompanyInfo : toggleCompanyEditMode}
                  className="transition-all duration-300"
                >
                  {companyEditMode ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Company
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Company Logo & Info Section */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center space-y-3">
                    {/* Company Logo */}
                    <div className="relative">
                      <div className="w-24 h-24 bg-muted/60 rounded-lg flex items-center justify-center overflow-hidden border border-border/60 shadow-sm">
                        {companyLogo ? (
                          <img
                            src={URL.createObjectURL(companyLogo)}
                            alt="Company Logo Preview"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building className="h-14 w-14 text-muted-foreground/70" />
                        )}
                      </div>
                      {companyEditMode && (
                        <div 
                          className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 cursor-pointer shadow-md hover:bg-primary/80 transition-colors"
                          onClick={handleCompanyLogoUploadClick}
                          title="Change company logo"
                        >
                          <Upload className="h-4 w-4" />
                          <input
                            type="file"
                            ref={companyLogoInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleCompanyLogoChange}
                          />
                        </div>
                      )}
                    </div>
                    {companyEditMode && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs"
                        onClick={handleCompanyLogoUploadClick}
                      >
                        Upload Logo
                      </Button>
                    )}
                  </div>

                  {/* Company Details */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Company Name */}
                      <div className="space-y-2">
                        <Label htmlFor="company-name" className="flex items-center text-sm font-medium">
                          <Building2 className="mr-2 h-4 w-4 text-gray-500" />
                          Company Name
                        </Label>
                        {companyEditMode ? (
                          <Input 
                            id="company-name" 
                            ref={companyNameRef}
                            defaultValue={companyName}
                            placeholder="Enter company name" 
                            className="border-gray-300 focus:border-primary"
                          />
                        ) : (
                          <div className="py-2 px-3 bg-muted/30 rounded-md text-foreground font-medium min-h-9">
                            {companyName || 'No company name set'}
                          </div>
                        )}
                      </div>

                      {/* Registration Number */}
                      <div className="space-y-2">
                        <Label htmlFor="reg-number" className="flex items-center text-sm font-medium">
                          <FileText className="mr-2 h-4 w-4 text-gray-500" />
                          Registration Number
                        </Label>
                        {companyEditMode ? (
                          <Input 
                            id="reg-number" 
                            ref={companyRegNumberRef}
                            placeholder="Enter company registration number" 
                            className="border-gray-300 focus:border-primary"
                          />
                        ) : (
                          <div className="py-2 px-3 bg-muted/30 rounded-md text-foreground font-medium min-h-9">
                            {companyRegNumber || 'No registration number set'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Company Email */}
                      <div className="space-y-2">
                        <Label htmlFor="company-email" className="flex items-center text-sm font-medium">
                          <Mail className="mr-2 h-4 w-4 text-gray-500" />
                          Company Email
                        </Label>
                        {companyEditMode ? (
                          <Input 
                            id="company-email" 
                            ref={companyEmailRef}
                            placeholder="company@example.com" 
                            className="border-gray-300 focus:border-primary"
                          />
                        ) : (
                          <div className="py-2 px-3 bg-muted/30 rounded-md text-foreground font-medium min-h-9">
                            {companyEmail || 'No email set'}
                          </div>
                        )}
                      </div>

                      {/* Company Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="company-phone" className="flex items-center text-sm font-medium">
                          <Phone className="mr-2 h-4 w-4 text-gray-500" />
                          Company Phone
                        </Label>
                        {companyEditMode ? (
                          <Input 
                            id="company-phone" 
                            ref={companyPhoneRef}
                            placeholder="+1 (555) 000-0000" 
                            className="border-gray-300 focus:border-primary"
                          />
                        ) : (
                          <div className="py-2 px-3 bg-muted/30 rounded-md text-foreground font-medium min-h-9">
                            {companyPhone || 'No phone number set'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Company Address */}
                    <<div className="space-y-2">
                      <Label htmlFor="company-address" className="flex items-center text-sm font-medium">
                        <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                        Company Address
                      </Label>
                      {companyEditMode ? (
                        <Input 
                          id="company-address" 
                          ref={companyAddressRef}
                          placeholder="Enter company address" 
                          className="border-gray-300 focus:border-primary"
                        />
                      ) : (
                        <div className="py-2 px-3 bg-muted/30 rounded-md text-foreground font-medium min-h-9">
                          {companyAddress || 'No address set'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Team Members Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Team Members</h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative overflow-x-auto rounded-lg border border-border/60 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase tracking-wide bg-muted/40 border-b border-border">
                          <tr>
                            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                              Name
                            </th>
                            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                              Email
                            </th>
                            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                              Role
                            </th>
                            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border last:border-0">
                            <td className="px-4 py-3 font-medium">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user?.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {getUserInitials()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{user?.name || "Current User"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {user?.email || "user@example.com"}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary">Admin</Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button variant="ghost" size="sm" disabled>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">Invite New Team Member</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Add colleagues to your company account
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          disabled
                          className="opacity-60 cursor-not-allowed"
                          title="Coming Soon"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Coming Soon
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-6 max-w-4xl relative">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-8 border-b border-border/40">
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription className="mt-1">
                Manage your payment methods, billing information and invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Payment Methods Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Methods</h3>

                  <div className="p-4 bg-muted/30 rounded-lg flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-14 rounded-md bg-muted/80 flex items-center justify-center mr-4">
                        <CreditCard className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Add Payment Method</h4>
                        <p className="text-sm text-muted-foreground">
                          No payment methods added yet
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="mt-3 md:mt-0">
                      Add Method
                    </Button>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium text-foreground">Billing Address</h4>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                          Same as company address
                        </p>
                        <div className="flex items-center mt-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-sm">123 Business Ave, Suite 100, San Francisco, CA 94107</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Invoices</h3>
                    <div className="relative overflow-x-auto rounded-lg border border-border/60 shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase tracking-wide bg-muted/40 border-b border-border">
                          <tr>
                            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                              <div className="flex items-center">
                                Invoice
                                <ArrowUpDown className="ml-1 h-3 w-3" />
                              </div>
                            </th>
                            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                              <div className="flex items-center">
                                Date
                                <ArrowUpDown className="ml-1 h-3 w-3" />
                              </div>
                            </th>
                            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                              <div className="flex items-center">
                                Amount
                                <ArrowUpDown className="ml-1 h-3 w-3" />
                              </div>
                            </th>
                            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                              <div className="flex items-center">
                                Status
                                <ArrowUpDown className="ml-1 h-3 w-3" />
                              </div>
                            </th>
                            <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border last:border-0">
                            <td colSpan={5} className="px-4 py-8 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <Receipt className="h-8 w-8 text-muted-foreground mb-2" />
                                <h4 className="font-medium text-foreground">No invoices yet</h4>
                                <p className="text-sm text-muted-foreground max-w-md mt-1">
                                  Your invoice history will appear here once you make your first payment
                                </p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Coming Soon Overlay */}
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="text-center p-6 max-w-md">
              <CreditCard className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                Payment management features are coming soon. We're working hard to bring you a seamless payment experience.
              </p>
              <Button onClick={() => setActiveTab("profile")}>
                Return to Profile
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Settings;