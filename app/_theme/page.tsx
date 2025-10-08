"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { HealthChip } from "@/components/health-chip"
import { StatusBadge } from "@/components/status-badge"
import { StatCard } from "@/components/stat-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Progress
} from "@/components/ui/progress"
import { 
  Switch
} from "@/components/ui/switch"
import { 
  Label
} from "@/components/ui/label"
import { 
  ChevronDown
} from "lucide-react"

export default function ThemePage() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-none space-y-6 sm:space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Design System Showcase</h1>
          <p className="text-lg text-muted-fg">
            Comprehensive display of all components using semantic design tokens
          </p>
        </div>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Brand Colors */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Brand</h3>
                <div className="space-y-1">
                  <div className="h-8 rounded border" style={{ backgroundColor: 'var(--brand)' }} />
                  <div className="h-6 rounded border" style={{ backgroundColor: 'var(--brand-600)' }} />
                  <div className="h-6 rounded border" style={{ backgroundColor: 'var(--brand-700)' }} />
                  <div className="h-6 rounded border" style={{ backgroundColor: 'var(--brand-50)' }} />
                </div>
              </div>

              {/* Status Colors */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Status</h3>
                <div className="space-y-1">
                  <div className="h-8 rounded border" style={{ backgroundColor: 'var(--success)' }} />
                  <div className="h-6 rounded border" style={{ backgroundColor: 'var(--warning)' }} />
                  <div className="h-6 rounded border" style={{ backgroundColor: 'var(--danger)' }} />
                </div>
              </div>

              {/* Surface Colors */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Surfaces</h3>
                <div className="space-y-1">
                  <div className="h-8 rounded border border-border" style={{ backgroundColor: 'var(--surface)' }} />
                  <div className="h-6 rounded border border-border" style={{ backgroundColor: 'var(--surface-2)' }} />
                  <div className="h-6 rounded border border-border" style={{ backgroundColor: 'var(--surface-3)' }} />
                </div>
              </div>

              {/* Chip Colors */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Chips</h3>
                <div className="space-y-1">
                  <div className="h-8 rounded border border-border" style={{ backgroundColor: 'var(--chip-green-bg)', color: 'var(--chip-green-fg)' }}>
                    <span className="text-xs p-1">Green</span>
                  </div>
                  <div className="h-6 rounded border border-border" style={{ backgroundColor: 'var(--chip-yellow-bg)', color: 'var(--chip-yellow-fg)' }}>
                    <span className="text-xs p-1">Yellow</span>
                  </div>
                  <div className="h-6 rounded border border-border" style={{ backgroundColor: 'var(--chip-red-bg)', color: 'var(--chip-red-fg)' }}>
                    <span className="text-xs p-1">Red</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">Heading 1</h1>
              <h2 className="text-3xl font-semibold text-foreground">Heading 2</h2>
              <h3 className="text-2xl font-medium text-foreground">Heading 3</h3>
              <h4 className="text-xl font-medium text-foreground">Heading 4</h4>
              <p className="text-base text-foreground">Body text with proper contrast</p>
              <p className="text-sm text-muted-fg">Muted text for secondary information</p>
              <p className="text-xs text-subtle-fg">Subtle text for metadata</p>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Components */}
        <Card>
          <CardHeader>
            <CardTitle>Status Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <HealthChip score={750} />
                <HealthChip score={550} />
                <HealthChip score={350} />
              </div>
              <div className="flex flex-wrap gap-4">
                <StatusBadge status="green" />
                <StatusBadge status="yellow" />
                <StatusBadge status="red" />
              </div>
              <div className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="select">Select</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notifications" />
              <Label htmlFor="notifications">Enable notifications</Label>
            </div>
            <div className="space-y-2">
              <Label>Progress</Label>
              <Progress value={65} />
            </div>
          </CardContent>
        </Card>

        {/* Data Display */}
        <Card>
          <CardHeader>
            <CardTitle>Data Display</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="Total Revenue"
                value="$2,500,000"
                delta={{ value: 12, label: "+12% from last month" }}
              />
              <StatCard
                title="Active Users"
                value="1,234"
                delta={{ value: -5, label: "-5% from last week" }}
              />
              <StatCard
                title="Conversion Rate"
                value="3.2%"
                delta={{ value: 0, label: "No change" }}
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Acme Corp</TableCell>
                  <TableCell><StatusBadge status="green" /></TableCell>
                  <TableCell><HealthChip score={750} /></TableCell>
                  <TableCell>$1,200,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Beta Inc</TableCell>
                  <TableCell><StatusBadge status="yellow" /></TableCell>
                  <TableCell><HealthChip score={550} /></TableCell>
                  <TableCell>$800,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Gamma LLC</TableCell>
                  <TableCell><StatusBadge status="red" /></TableCell>
                  <TableCell><HealthChip score={350} /></TableCell>
                  <TableCell>$500,000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Interactive Components */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList>
                  <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="mt-4">
                  <p className="text-muted-fg">Content for tab 1</p>
                </TabsContent>
                <TabsContent value="tab2" className="mt-4">
                  <p className="text-muted-fg">Content for tab 2</p>
                </TabsContent>
                <TabsContent value="tab3" className="mt-4">
                  <p className="text-muted-fg">Content for tab 3</p>
                </TabsContent>
              </Tabs>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is it accessible?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It adheres to the WAI-ARIA design pattern.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Is it styled?</AccordionTrigger>
                  <AccordionContent>
                    Yes. It comes with default styles that matches the other components.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog Title</DialogTitle>
                      <DialogDescription>
                        This is a dialog description with proper contrast.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-muted-fg">Dialog content goes here.</p>
                    </div>
                  </DialogContent>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Open Menu <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover for tooltip</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is a tooltip with proper contrast</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Focus States */}
        <Card>
          <CardHeader>
            <CardTitle>Focus States</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-fg">
                Use Tab key to navigate and see focus indicators
              </p>
              <div className="flex gap-4">
                <Button>Focusable Button</Button>
                <Input placeholder="Focusable Input" />
                <Badge className="cursor-pointer">Focusable Badge</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
