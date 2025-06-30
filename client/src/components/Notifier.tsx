import { useEffect } from "react";
import { useSnackbar } from "notistack";
import { useSelector } from "../store";

const Notifier = () => {
  const { error } = useSelector((state) => state.auth);
  const { error: projectError } = useSelector((state) => state.projects);
  const { error: taskError } = useSelector((state) => state.tasks);
  const { enqueueSnackbar } = useSnackbar();

  // Helper: ignore errors for create/update/delete/add actions
  const shouldShow = (msg?: string) =>
    msg && !/delete|update|edit|create|add/i.test(msg);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: "error" });
  }, [error, enqueueSnackbar]);

  useEffect(() => {
    if (shouldShow(projectError as string))
      enqueueSnackbar(projectError, { variant: "error" });
  }, [projectError, enqueueSnackbar]);

  useEffect(() => {
    if (shouldShow(taskError as string))
      enqueueSnackbar(taskError, { variant: "error" });
  }, [taskError, enqueueSnackbar]);

  return null;
};

export default Notifier;
