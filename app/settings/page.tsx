"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ModeToggle } from "@/components/mode-toggle"
import { useSettings } from "@/lib/contexts/settings-context"
import { Check, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function Settings() {
  const { settings, updateSettings } = useSettings()
  const [fontSize, setFontSize] = useState(settings.appearance.fontSize)
  const [responseLength, setResponseLength] = useState(settings.ai.responseLength)

  // Update font size and response length when settings change
  useEffect(() => {
    setFontSize(settings.appearance.fontSize)
    setResponseLength(settings.ai.responseLength)
  }, [settings])

  const handleSaveAppearance = () => {
    updateSettings("appearance", { fontSize })
    toast.success("Appearance settings saved!")
  }

  const handleSaveNotifications = () => {
    toast.success("Notification settings saved!")
  }

  const handleSaveAI = () => {
    updateSettings("ai", { responseLength })
    toast.success("AI settings saved!")
  }

  const handleSaveProfile = () => {
    updateSettings("profile", {
      name: (document.getElementById("name") as HTMLInputElement)?.value || settings.profile.name,
      email: (document.getElementById("email") as HTMLInputElement)?.value || settings.profile.email,
      bio: (document.getElementById("bio") as HTMLInputElement)?.value || settings.profile.bio,
    })
    toast.success("Profile settings saved!")
  }

  const handleSaveTimeZone = () => {
    updateSettings("profile", {
      timeZone: (document.getElementById("timezone") as HTMLSelectElement)?.value || settings.profile.timeZone,
    })
    updateSettings("appearance", {
      use24HourFormat: (document.getElementById("24hour") as HTMLInputElement)?.checked || false,
    })
    toast.success("Time zone settings saved!")
  }

  const handleSaveAPIKeys = () => {
    updateSettings("ai", {
      apiKey: (document.getElementById("gemini-key") as HTMLInputElement)?.value || settings.ai.apiKey,
    })
    toast.success("API keys saved!")
  }

  const handleColorSelect = (color: string) => {
    updateSettings("appearance", { accentColor: color })
    toast.success(`Accent color updated to ${color}!`)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col p-6 md:p-8 space-y-6 max-w-3xl mx-auto"
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </motion.div>

      <Tabs defaultValue="appearance" className="w-full" onValueChange={(value) => {
        // Add a subtle animation when changing tabs
        document.querySelector(`[data-value="${value}"]`)?.scrollIntoView({ behavior: 'smooth' });
      }}>
        <TabsList className="grid w-full grid-cols-4 sticky top-0 z-10 bg-background">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4" data-value="general">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={settings.profile.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={settings.profile.email} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" defaultValue={settings.profile.bio} />
              </div>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time Zone</CardTitle>
              <CardDescription>Set your local time zone for accurate scheduling.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Time Zone</Label>
                <Select defaultValue={settings.profile.timeZone}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-new_york">Eastern Time (ET)</SelectItem>
                    <SelectItem value="america-chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="america-denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="america-los_angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="etc-utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="24hour" checked={settings.appearance.use24HourFormat} />
                <Label htmlFor="24hour">Use 24-hour format</Label>
              </div>
              <Button onClick={handleSaveTimeZone}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4 space-y-4" data-value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Customize the appearance of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme Mode</Label>
                <ModeToggle />
              </div>

              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "rose", color: "bg-rose-500" },
                    { name: "orange", color: "bg-orange-500" },
                    { name: "emerald", color: "bg-emerald-500" },
                    { name: "sky", color: "bg-sky-500" },
                    { name: "violet", color: "bg-violet-500" },
                    { name: "pink", color: "bg-pink-500" },
                    { name: "blue", color: "bg-blue-500" },
                    { name: "red", color: "bg-red-500" },
                    { name: "green", color: "bg-green-500" },
                    { name: "yellow", color: "bg-yellow-500" },
                    { name: "purple", color: "bg-purple-500" },
                    { name: "indigo", color: "bg-indigo-500" },
                  ].map((item) => (
                    <motion.div
                      key={item.name}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        className={`w-10 h-10 rounded-full ${item.color} relative`}
                        onClick={() => handleColorSelect(item.name)}
                      >
                        {settings.appearance.accentColor === item.name && (
                          <CheckCircle2 className="absolute inset-0 m-auto text-white h-5 w-5" />
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Size</Label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">Small</span>
                  <Slider 
                    value={[fontSize]} 
                    min={12} 
                    max={20} 
                    step={1} 
                    onValueChange={(value) => setFontSize(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm">Large</span>
                </div>
                <div className="text-center text-sm text-muted-foreground mt-1">
                  Current: {fontSize}px
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="animations" 
                  checked={settings.appearance.animations}
                  onCheckedChange={(checked) => updateSettings("appearance", { animations: checked })}
                />
                <Label htmlFor="animations">Enable animations</Label>
              </div>

              <Button onClick={handleSaveAppearance}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4" data-value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for task reminders and updates.</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications.enabled}
                  onCheckedChange={(checked) => updateSettings("notifications", { enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-effects">Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound effects for notifications and task completion.
                  </p>
                </div>
                <Switch 
                  id="sound-effects" 
                  checked={settings.notifications.soundEffects}
                  onCheckedChange={(checked) => updateSettings("notifications", { soundEffects: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="focus-reminders">Focus Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders to take breaks during focus sessions.
                  </p>
                </div>
                <Switch 
                  id="focus-reminders" 
                  checked={settings.notifications.focusReminders}
                  onCheckedChange={(checked) => updateSettings("notifications", { focusReminders: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder-time">Reminder Time</Label>
                <Select 
                  defaultValue={settings.notifications.reminderTime}
                  onValueChange={(value) => updateSettings("notifications", { reminderTime: value })}
                >
                  <SelectTrigger id="reminder-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes before</SelectItem>
                    <SelectItem value="10">10 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveNotifications}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-4 space-y-4" data-value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Settings</CardTitle>
              <CardDescription>Configure how the AI assistant works for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-model">AI Model</Label>
                <Select 
                  defaultValue={settings.ai.model}
                  onValueChange={(value) => updateSettings("ai", { model: value })}
                >
                  <SelectTrigger id="ai-model">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                    <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude">Claude</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="ai-suggestions" 
                  checked={settings.ai.enableSuggestions}
                  onCheckedChange={(checked) => updateSettings("ai", { enableSuggestions: checked })}
                />
                <Label htmlFor="ai-suggestions">Enable AI task suggestions</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="ai-prioritization" 
                  checked={settings.ai.enablePrioritization}
                  onCheckedChange={(checked) => updateSettings("ai", { enablePrioritization: checked })}
                />
                <Label htmlFor="ai-prioritization">Enable AI task prioritization</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="ai-time-estimates" 
                  checked={settings.ai.enableTimeEstimates}
                  onCheckedChange={(checked) => updateSettings("ai", { enableTimeEstimates: checked })}
                />
                <Label htmlFor="ai-time-estimates">Enable AI time estimates</Label>
              </div>

              <div className="space-y-2">
                <Label>AI Response Length</Label>
                <Slider 
                  value={[responseLength]} 
                  min={0} 
                  max={100} 
                  step={10} 
                  onValueChange={(value) => setResponseLength(value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Concise</span>
                  <span>Detailed</span>
                </div>
              </div>

              <Button onClick={handleSaveAI}>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Configure API keys for AI services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gemini-key">Gemini API Key</Label>
                <Input 
                  id="gemini-key" 
                  type="password" 
                  placeholder="AIza..." 
                  defaultValue={settings.ai.apiKey}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get your API key from the <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>
                </p>
              </div>

              <Button onClick={handleSaveAPIKeys}>Save API Keys</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
