import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
  Send
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);

  // Mock data for user profile - in real app this would come from API
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/users/current'],
    queryFn: async () => {
      const response = await fetch('/api/users/current');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    }
  });

  const handleSaveProfile = () => {
    setEditMode(false);
    // In a real app, this would save the profile data
  };

  return (
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
                  onClick={() => setEditMode(!editMode)}
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
                      <Button variant="outline" className="mt-2 md:mt-0">
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
                      <Button variant="destructive" className="mt-2 md:mt-0">
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
        <TabsContent value="company" className="space-y-4">
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
                    <div className="h-32 w-32 bg-gray-100 dark:bg-[rgb(30,30,30)] rounded-lg flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-gray-400" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                  </div>

                  <div className="flex-1 grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input id="companyName" placeholder="Acme Inc." />
                      </div>
                      <div>
                        <Label htmlFor="businessType">Business Type</Label>
                        <Input id="businessType" placeholder="Software Development" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyEmail">Company Email</Label>
                        <Input id="companyEmail" type="email" placeholder="info@acme.com" />
                      </div>
                      <div>
                        <Label htmlFor="companyPhone">Company Phone</Label>
                        <Input id="companyPhone" placeholder="+1 (555) 123-4567" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="123 Business St, Suite 100" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="New York" />
                      </div>
                      <div>
                        <Label htmlFor="state">State/Province</Label>
                        <Input id="state" placeholder="NY" />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">Zip/Postal Code</Label>
                        <Input id="zipCode" placeholder="10001" />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button>Save Company Info</Button>
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

                    <Button variant="outline" className="w-full">
                      <Users className="mr-2 h-4 w-4" />
                      Invite Team Member
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
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-[rgb(30,30,30)] rounded-lg flex flex-col md:flex-row justify-between">
                      <div>
                        <p className="font-medium">Invoice #INV-001</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">March 1, 2025</p>
                        <div className="text-sm font-medium bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full inline-block mt-2">
                          Paid
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <p className="font-medium">$49.99</p>
                        <Button variant="outline" size="sm">
                          <Receipt className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-[rgb(30,30,30)] rounded-lg flex flex-col md:flex-row justify-between">
                      <div>
                        <p className="font-medium">Invoice #INV-002</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">February 1, 2025</p>
                        <div className="text-sm font-medium bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full inline-block mt-2">
                          Paid
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <p className="font-medium">$49.99</p>
                        <Button variant="outline" size="sm">
                          <Receipt className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Billing Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billingName">Contact Name</Label>
                      <Input id="billingName" placeholder="John Doe" />
                    </div>
                    <div>
                      <Label htmlFor="billingEmail">Contact Email</Label>
                      <Input id="billingEmail" type="email" placeholder="billing@example.com" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button>
                      <Send className="mr-2 h-4 w-4" />
                      Update Billing Contact
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Settings;