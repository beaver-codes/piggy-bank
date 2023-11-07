import React from "react";

const IconToggle = React.forwardRef(({ onClick, className, icon, disabled, type }: any, ref: any) => {
    const filteredClassName = className.replace('dropdown-toggle', '');

    return <button className="btn" onClick={onClick} ref={ref} disabled={disabled} type={type}>
        <i className={`bi ${icon} ${filteredClassName}`} />
    </button>
});

export const ThreeDotsToggle = React.forwardRef((props: any, ref: any) => {
    return <IconToggle icon="bi-three-dots-vertical" ref={ref} {...props} />
});
export const ThreeLinesToggle = React.forwardRef((props: any, ref: any) => {
    return <IconToggle icon="bi-list" ref={ref} {...props} />
});
export const AccountLinesToggle = React.forwardRef((props: any, ref: any) => {
    return <IconToggle icon="bi-person-lines-fill" ref={ref} {...props} />
});
