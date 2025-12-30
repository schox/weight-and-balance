import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, Mail, Phone, User } from 'lucide-react';

interface InfoDialogProps {
  children?: React.ReactNode;
}

const InfoDialog: React.FC<InfoDialogProps> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Info className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Application Information</DialogTitle>
          <DialogDescription>
            Weight & Balance Calculator for Curtin Flying Club
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Developer Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Developer Contact</h4>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Andrew Schox</span>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href="mailto:andrew@andrewschox.com"
                  className="text-sm text-primary hover:underline"
                >
                  andrew@andrewschox.com
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href="tel:0413759721"
                  className="text-sm text-primary hover:underline"
                >
                  0413 759 721
                </a>
              </div>
            </div>
          </div>

          {/* Application Information */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">About</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                This weight and balance calculator is designed specifically for
                aviation use and helps pilots ensure their aircraft is loaded
                within safe operating limits.
              </p>
              <p className="mt-2 font-medium text-warning">
                ⚠️ This tool is for planning purposes only. Always verify
                calculations with official aircraft documentation.
              </p>
            </div>
          </div>
        </div>
        </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;