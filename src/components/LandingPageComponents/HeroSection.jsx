import React from 'react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import { CheckCheckIcon } from 'lucide-react'
import Hero from '../../assets/hero.svg'

const HeroSection = () => {
    return (
        <div className='w-full h-screen flex flex-col lg:flex-row justify-center items-center px-4 lg:px-8'>
            <div className='w-full lg:w-1/2 h-auto lg:h-full flex flex-col justify-center items-center lg:items-start gap-4'>
                <main className="text-2xl sm:text-3xl md:text-4xl font-bold text-center lg:text-left">
                    <h1 className="inline">
                        <span className="inline bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">Elevate </span>
                        Your Career with <br />
                    </h1>
                    Effortless
                    <h2 className="inline">
                        <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text"> Resume Tailoring</span>
                    </h2>
                </main>
                <p className="text-base sm:text-lg text-muted-foreground text-center lg:text-left sm:mx-auto lg:mx-0 lg:w-10/12">
                    Instantly create personalized resumes and cover letters tailored to every job opportunity, all in just a few clicks.
                </p>
                <div className='flex justify-center lg:justify-start'>
                    <Link to="/auth">
                        <Button className='bg-[#77a388]'>
                            <CheckCheckIcon /> Get Started
                        </Button>
                    </Link>
                </div>
            </div>

            <div className='w-full lg:w-1/2 h-auto flex justify-center items-center mt-20 lg:mt-0'>
                <img src={Hero} alt="Hero Image" className='max-w-full sm:max-w-md lg:max-w-lg' />
            </div>
        </div>

    )
}

export default HeroSection