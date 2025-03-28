import { useState, useRef } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
  Send,
  AlertTriangle
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form refs for profile data
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  
  // Refs for company data
  const companyNameRef = useRef<HTMLInputElement>(null);
  const businessTypeRef = useRef<HTMLInputElement>(null);
  const companyEmailRef = useRef<HTMLInputElement>(null);
  const companyPhoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const zipCodeRef = useRef<HTMLInputElement>(null);
  
  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // Company logo
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current user data
  const { data: user, isLoading: isLoadingUser, refetch: refetchUser } = useQuery({
    queryKey: ['/api/user'],
    retry: false
  });
  
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
  const uploadLogoMutation = useMutation({
    mutationFn: async (logoFile: File) => {
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const response = await fetch('/api/company/logo', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logo uploaded",
        description: "Your company logo has been uploaded successfully.",
      });
      setCompanyLogo(null);
    },
    onError: () => {
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

  // Handle saving profile changes
  const handleSaveProfile = () => {
    if (!editMode) {
      setEditMode(true);
      return;
    }
    
    const profileData = {
      name: nameRef.current?.value,
      email: emailRef.current?.value,
      phone: phoneRef.current?.value,
      location: locationRef.current?.value
    };
    
    updateProfileMutation.mutate(profileData);
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
  
  // Handle company info save
  const handleSaveCompanyInfo = () => {
    const companyData = {
      name: companyNameRef.current?.value,
      businessType: businessTypeRef.current?.value,
      email: companyEmailRef.current?.value,
      phone: companyPhoneRef.current?.value,
      address: addressRef.current?.value,
      city: cityRef.current?.value,
      state: stateRef.current?.value,
      zipCode: zipCodeRef.current?.value
    };
    
    saveCompanyInfoMutation.mutate(companyData);
    
    // If there's a logo file, upload it separately
    if (companyLogo) {
      uploadLogoMutation.mutate(companyLogo);
    }
  };
  
  // Handle logo selection
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCompanyLogo(event.target.files[0]);
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <main className="w-full h-full overflow-y-auto bg-background p-4 md:p-6 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your profile, company information, and payment settings
          </p>
        </div>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              User Profile
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

          {/* User Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account profile information
                    </CardDescription>
                  </div>
                  <Button 
                    variant={editMode ? "default" : "outline"}
                    onClick={handleSaveProfile}
                  >
                    {editMode ? (
                      <>Save</>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center space-y-3">
                      {isLoadingUser ? (
                        <Skeleton className="h-32 w-32 rounded-full" />
                      ) : (
                        <Avatar className="h-32 w-32">
                          <AvatarImage 
                            src={user?.avatar || "https://api.dicebear.com/7.x/identicon/svg?seed=John"} 
                            alt={user?.name || "User"} 
                          />
                          <AvatarFallback>{user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}</AvatarFallback>
                        </Avatar>
                      )}
                      {editMode && (
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Change Photo
                        </Button>
                      )}
                    </div>

                    <div className="flex-1 grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          {editMode ? (
                            <Input 
                              id="name" 
                              ref={nameRef}
                              defaultValue={user?.name || ""} 
                              placeholder="John Doe" 
                            />
                          ) : (
                            <div className="mt-1 text-gray-900 dark:text-white font-medium py-2">
                              {isLoadingUser ? <Skeleton className="h-6 w-48" /> : user?.name || "Not set"}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          {editMode ? (
                            <Input 
                              id="email"
                              ref={emailRef}
                              type="email" 
                              defaultValue={user?.email || ""} 
                              placeholder="john@example.com" 
                            />
                          ) : (
                            <div className="mt-1 text-gray-900 dark:text-white font-medium py-2">
                              {isLoadingUser ? <Skeleton className="h-6 w-48" /> : user?.email || "Not set"}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          {editMode ? (
                            <Input 
                              id="phone"
                              ref={phoneRef}
                              defaultValue={user?.phone || ""} 
                              placeholder="+1 (555) 000-0000" 
                            />
                          ) : (
                            <div className="mt-1 text-gray-900 dark:text-white font-medium py-2">
                              {isLoadingUser ? <Skeleton className="h-6 w-48" /> : user?.phone || "Not set"}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          {editMode ? (
                            <Input 
                              id="location"
                              ref={locationRef}
                              defaultValue={user?.location || ""} 
                              placeholder="New York, USA" 
                            />
                          ) : (
                            <div className="mt-1 text-gray-900 dark:text-white font-medium py-2">
                              {isLoadingUser ? <Skeleton className="h-6 w-48" /> : user?.location || "Not set"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Account Security</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 dark:bg-[rgb(30,30,30)] rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Password</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Last changed: {user?.lastPasswordChange || "Never"}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="mt-2 md:mt-0"
                          onClick={() => setPasswordDialogOpen(true)}
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          Change Password
                        </Button>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 dark:bg-[rgb(30,30,30)] rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Sign Out</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sign out from all devices
                          </p>
                        </div>
                        <Button 
                          variant="destructive" 
                          className="mt-2 md:mt-0"
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
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-4 relative">
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  The Company page is under development and will be available soon. Thank you for your patience!
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("profile")}
                >
                  Return to Profile
                </Button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Manage your company profile and team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="h-32 w-32 bg-gray-100 dark:bg-[rgb(30,30,30)] rounded-lg flex items-center justify-center overflow-hidden">
                        {companyLogo ? (
                          <img 
                            src={URL.createObjectURL(companyLogo)} 
                            alt="Company Logo Preview" 
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Building2 className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button variant="outline" size="sm" onClick={handleUploadClick}>
                        <Upload className="mr-2 h-4 w-4" />
                        {companyLogo ? "Change Logo" : "Upload Logo"}
                      </Button>
                    </div>

                    <div className="flex-1 grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input id="companyName" ref={companyNameRef} placeholder="Acme Inc." />
                        </div>
                        <div>
                          <Label htmlFor="businessType">Business Type</Label>
                          <Input id="businessType" ref={businessTypeRef} placeholder="Software Development" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="companyEmail">Company Email</Label>
                          <Input id="companyEmail" ref={companyEmailRef} type="email" placeholder="info@acme.com" />
                        </div>
                        <div>
                          <Label htmlFor="companyPhone">Company Phone</Label>
                          <Input id="companyPhone" ref={companyPhoneRef} placeholder="+1 (555) 123-4567" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" ref={addressRef} placeholder="123 Business St, Suite 100" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input id="city" ref={cityRef} placeholder="New York" />
                        </div>
                        <div>
                          <Label htmlFor="state">State/Province</Label>
                          <Input id="state" ref={stateRef} placeholder="NY" />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">Zip/Postal Code</Label>
                          <Input id="zipCode" ref={zipCodeRef} placeholder="10001" />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleSaveCompanyInfo}>Save Company Info</Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Team Members</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[rgb(30,30,30)] rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">John Doe</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">john@example.com</p>
                          </div>
                        </div>
                        <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                          Owner
                        </div>
                      </div>

                      <Button variant="outline" className="w-full" disabled>
                        <Users className="mr-2 h-4 w-4" />
                        Invite Team Member
                        <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                          Coming Soon
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your payment methods and billing preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-[rgb(30,30,30)] rounded-lg flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Visa ending in 4242</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Expires 04/2025</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">Remove</Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Billing History</h3>
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-[rgb(30,30,30)] rounded-lg">
                        <div>
                          <p className="font-medium">Invoice #INV-001</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Mar 01, 2025</p>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0">
                          <span className="text-green-600 dark:text-green-400 text-sm mr-3">Paid</span>
                          <span className="text-gray-900 dark:text-white font-medium mr-3">$29.99</span>
                          <Button variant="ghost" size="sm">
                            <Receipt className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-[rgb(30,30,30)] rounded-lg">
                        <div>
                          <p className="font-medium">Invoice #INV-002</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Feb 01, 2025</p>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0">
                          <span className="text-green-600 dark:text-green-400 text-sm mr-3">Paid</span>
                          <span className="text-gray-900 dark:text-white font-medium mr-3">$29.99</span>
                          <Button variant="ghost" size="sm">
                            <Receipt className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to change it.
            </DialogDescription>
          </DialogHeader>
          
          {passwordError && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm p-3 rounded-md border border-red-200 dark:border-red-800">
              {passwordError}
            </div>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
              />
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setPasswordDialogOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setPasswordError("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? "Saving..." : "Save Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Settings;