import React from 'react'
import ToggleTheme from '../ToggleTheme'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import Logo from '../../assets/Logo.png'

const Navbar = () => {
    return (
        <div className='w-full h-16 flex justify-between items-center border-b px-8 py-4 fixed top-0 dark:bg-gray-900 bg-white'>
            <div className='w-24 flex items-center'>
                <img src={Logo} alt="" className='w-full' />
            </div>
            <div className='ml-4 flex gap-4'>
                <Button variant='secondary'>
                    <Link to='/auth'>Login</Link>
                </Button>
                <ToggleTheme />
            </div>
        </div>
    )
}

export default Navbar