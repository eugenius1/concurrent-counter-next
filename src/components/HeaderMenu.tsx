"use client";
import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Tooltip from "@mui/material/Tooltip";

/** An icon button in the header that opens a menu of choices below it. */
export default function HeaderMenu({
  id,
  label,
  icon,
  onOpen,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  onOpen?: () => void;
  children: (close: () => void) => React.ReactNode;
}) {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);
  return (
    <>
      <Tooltip title={label}>
        <IconButton
          aria-label={label}
          aria-haspopup="menu"
          aria-controls={anchor ? id : undefined}
          aria-expanded={anchor ? "true" : undefined}
          color="inherit"
          onClick={(event) => {
            onOpen?.();
            setAnchor(event.currentTarget);
          }}
        >
          {icon}
        </IconButton>
      </Tooltip>
      <Menu
        id={id}
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {children(close)}
      </Menu>
    </>
  );
}
