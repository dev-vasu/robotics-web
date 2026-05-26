import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROBOVIBE_HQ | Secure Admin Portal",
  icons: {
    icon: '/hq-icon.svg',
  },
};

export default function HQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
