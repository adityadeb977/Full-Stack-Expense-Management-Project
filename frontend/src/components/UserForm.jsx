import { useForm } from "react-hook-form";
import React from 'react'
import API from './services/api'
const UserForm = ({ fetchUsers, onClose, titleId }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState : {errors,isSubmitting},
    }=useForm()

    const onSubmit = async (data) => {
        try {
            await API.post("/users", data);
            fetchUsers();
            reset();
            onClose();
        } catch (error) {
            console.error(error);
        }
    }
  return (
    <div className="rounded-xl bg-white p-6 shadow-xl ring-1 ring-black/10">
      <div className="flex items-center justify-between mb-4">
        <h3 id={titleId} className="text-2xl font-bold">Add Employee</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
        <div>
            <input className="focus:outline:none border border-gray-300 w-full px-3 py-2 focus:border-blue-500" placeholder="Enter Name" type="text" {...register("name",{ required:{value:true, message:"Please enter your name"},minLength:{value:3,message:"Name should be atleast 3 characters"}})}/>
            {errors.name && <div className="text-red-500">{errors.name.message}</div>}
        </div>
        <div>
            <input className="focus:outline-none border border-gray-300 w-full px-3 py-2 focus:border-blue-500" placeholder="Enter email id" type="email" {...register("email",{required:{value:true,message:"Please enter your email"},minLength:{value:11,message:"Email should be at least 11 characters"},  pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Invalid email address"
    }})} />
            {errors.email && <div className="text-red-500">{errors.email.message}</div>}
        </div>
        <div>
            <input className="focus:outline-none border border-gray-300 w-full px-3 py-2 focus:border-blue-500" placeholder="Enter password" type="password" {...register("password",{required:{value:true,message:"Please enter a password"},minLength:{value:6,message:"Password should be at least 6 characters"}})} />
            {errors.password && <div className="text-red-500">{errors.password.message}</div>}
        </div>
        <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Role</label>
            <select className="focus:outline-none border border-gray-300 w-full px-3 py-2 focus:border-blue-500" {...register("role") }>
                <option value="user">Employee</option>
                <option value="manager">Manager</option>
            </select>
        </div>
        <div className="flex justify-between">
      <button disabled={isSubmitting} type="submit" className="py-3 px-3 bg-[#193680] rounded-xl hover:bg-[#26479b] text-white">Submit</button>
      {isSubmitting && <div>Loading....</div>}
      <button type="button" className="py-3 px-3 bg-[#193680] rounded-xl hover:bg-[#26479b] text-white" onClick={onClose}>Close</button>
      </div>
    </form>
    </div>
  )
}

export default UserForm
