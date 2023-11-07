import React, { FC } from 'react'
import { Button, ButtonProps, Spinner } from 'react-bootstrap'

interface IProps {
    processing: boolean
}

/**
* @author
* @function @ButtonProcessing
**/

export const ButtonProcessing: FC<IProps & ButtonProps> = ({ children, processing, disabled, ...rest }) => {
    return (
        <Button {...rest} disabled={processing || disabled}>
            <div className='center'>{processing && <Spinner size='sm' className='me-2' />} {children}</div>
        </Button>
    )
}
