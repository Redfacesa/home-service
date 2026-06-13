
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { WhatsAppProvider } from "@/contexts/WhatsAppContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import {
  CancellationPolicy,
  ContactUs,
  FAQ,
  PrivacyPolicy,
  SafetyAndSecurity,
  TermsOfService,
} from "./pages/LegalPages";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <LocationProvider>
            <WhatsAppProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="/cancellation-policy" element={<CancellationPolicy />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/safety-security" element={<SafetyAndSecurity />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </WhatsAppProvider>
          </LocationProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
