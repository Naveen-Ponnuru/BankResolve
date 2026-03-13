import authService from "../services/authService";

/**
 * React Router Action for Login
 */
export async function loginAction({ request }) {
    const data = await request.formData();
    const loginData = {
        email: data.get("email"),
        password: data.get("password"),
        bankCode: data.get("bankCode"),
    };

    const errors = {};
    if (!loginData.email) errors.email = "Email is required";
    if (!loginData.password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    try {
        const response = await authService.login(
            loginData.email,
            loginData.password,
            loginData.bankCode
        );
        const { user, jwtToken, bankCode, bankName } = response;
        return { success: true, user, jwtToken, bankCode, bankName };
    } catch (error) {
        if (error.response?.status === 401) {
            return {
                success: false,
                errors: { message: "Invalid email or password" },
            };
        }
        throw new Response(
            error.response?.data?.message || error.message || "Failed to login.",
            { status: error.response?.status || 500 },
        );
    }
}

/**
 * React Router Action for Registration
 */
export async function registerAction({ request }) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const errors = {};
    // UI field name is "name"
    if (!data.name) errors.name = "Full name is required";
    if (!data.email) errors.email = "Email is required";
    if (!data.password) errors.password = "Password is required";

    const role = data.role || "CUSTOMER";
    let bankCode = data.bankCode;
    if (!bankCode && data.bankCodeFromContext) {
        bankCode = data.bankCodeFromContext;
    }

    if (role !== "CUSTOMER" && role !== "ADMIN" && !bankCode) {
        errors.bankCode = "Bank association is required for staff/managers";
    }

    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    try {
        // Backend expects: { name, email, password, mobileNumber, bankCode, role }
        const registrationPayload = {
            name: data.name,
            email: data.email,
            password: data.password,
            mobileNumber: data.phone, // UI sends 'phone', backend expects 'mobileNumber'
            bankCode: bankCode,
            role: role
        };

        const response = await authService.register(registrationPayload);
        return { success: true, user: response?.user || null };
    } catch (error) {
        return {
            success: false,
            errors: { message: error.response?.data?.message || "Registration failed." },
        };
    }
}
