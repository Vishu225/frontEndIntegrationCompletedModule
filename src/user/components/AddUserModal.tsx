import { JSX } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../shared/axiosInstance";
import { useState } from "react";

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}
interface AddUserForm {
  name: string;
  email: string;
  password: string;
  department: string;
  managerId: string;
  role: string;
  status: string;
}
type FormErrors = Partial<Record<keyof AddUserForm, string>>;

export default function AddUserModal({
  onClose,
  onSuccess,
}: AddUserModalProps): JSX.Element {
  const [form, setForm] = useState<AddUserForm>({
    name: "",
    email: "",
    password: "",
    department: "",
    managerId: "",
    role: "EMPLOYEE",
    status: "ACTIVE",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    if (!form.department.trim())
      newErrors.department = "Department is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await axiosInstance.post("/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department,
        managerId: form.managerId ? Number(form.managerId) : undefined,
        role: form.role,
        status: form.status,
      });
      toast.success("User created successfully!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const e = error as { response?: { status?: number; data?: unknown } };
      if (e.response?.status === 409) toast.error("User already exists!");
      else {
        const msg =
          typeof e.response?.data === "string"
            ? e.response.data
            : (e.response?.data as { message?: string })?.message ||
              "Failed to create user.";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="results-modal animate__animated animate__zoomIn animate__faster"
        style={{ maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="results-modal-header">
          <h2
            className="fw-bold mb-0"
            style={{ color: "var(--primary-navy)", fontSize: "1.1rem" }}
          >
            <i className="bi bi-person-plus-fill me-2" />
            Add New User
          </h2>
          <button onClick={onClose} className="action-btn close-btn">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="results-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`input-field${errors.name ? " border-danger" : ""}`}
                placeholder="John Doe"
              />
              {errors.name && (
                <small className="text-danger">{errors.name}</small>
              )}
            </div>
            <div className="form-group mb-3">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={`input-field${errors.email ? " border-danger" : ""}`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <small className="text-danger">{errors.email}</small>
              )}
            </div>
            <div className="form-group mb-3">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className={`input-field${errors.password ? " border-danger" : ""}`}
              />
              {errors.password && (
                <small className="text-danger">{errors.password}</small>
              )}
            </div>
            <div className="form-group mb-3">
              <label>Department</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                className={`input-field${errors.department ? " border-danger" : ""}`}
                placeholder="Engineering"
              />
              {errors.department && (
                <small className="text-danger">{errors.department}</small>
              )}
            </div>
            <div className="form-group mb-3">
              <label>
                Manager ID{" "}
                <span style={{ color: "var(--muted-text)", fontWeight: 400 }}>
                  (optional)
                </span>
              </label>
              <input
                name="managerId"
                type="number"
                value={form.managerId}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. 5"
              />
            </div>
            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="d-flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-grad"
                style={{ flex: 1, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Creating..." : "Create User"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="action-btn close-btn"
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-md)",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
