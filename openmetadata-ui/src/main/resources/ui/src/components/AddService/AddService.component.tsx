import { DynamicFormFieldType, StepperStepType } from 'Models';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  getAddServicePath,
  ONLY_NUMBER_REGEX,
  ROUTES,
} from '../../constants/constants';
import { PageLayoutType } from '../../enums/layout.enum';
import { ServiceCategory } from '../../enums/service.enum';
import { DashboardServiceType } from '../../generated/entity/services/dashboardService';
import { MessagingServiceType } from '../../generated/entity/services/messagingService';
import { DataObj } from '../../interface/service.interface';
import {
  getAirflowPipelineTypes,
  getIsIngestionEnable,
  getKeyValueObject,
} from '../../utils/ServiceUtils';
import SVGIcons, { Icons } from '../../utils/SvgUtils';
import { Button } from '../buttons/Button/Button';
import PageLayout from '../containers/PageLayout';
import IngestionStepper from '../IngestionStepper/IngestionStepper.component';
import { AddServiceProps } from './AddService.interface';
import ConfigureService from './Steps/ConfigureService';
import ConnectionDetails from './Steps/ConnectionDetails';
import SelectServiceType from './Steps/SelectServiceType';

const STEPS_FOR_ADD_SERVICE: Array<StepperStepType> = [
  { name: 'Select Service Type', step: 1 },
  { name: 'Configure Service', step: 2 },
  { name: 'Connection Details', step: 3 },
];

const AddService = ({
  serviceCategory,
  onSave,
  handleAddIngestion,
}: AddServiceProps) => {
  const history = useHistory();
  const [showErrorMessage, setShowErrorMessage] = useState({
    serviceType: false,
    name: false,
    duplicateName: false,
  });
  const [activeStepperStep, setActiveStepperStep] = useState(1);
  const [selectServiceType, setSelectServiceType] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [port, setPort] = useState('');
  const [database, setDatabase] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [account, setAccount] = useState('');
  const [connectionOptions, setConnectionOptions] = useState<
    DynamicFormFieldType[]
  >([]);
  const [connectionArguments, setConnectionArguments] = useState<
    DynamicFormFieldType[]
  >([]);
  const [brokers, setBrokers] = useState('');
  const [schemaRegistry, setSchemaRegistry] = useState('');
  const [pipelineUrl, setPipelineUrl] = useState('');
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [env, setEnv] = useState('');
  const [apiVersion, setApiVersion] = useState('');
  const [server, setServer] = useState('');
  const [siteName, setSiteName] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleServiceTypeClick = (type: string) => {
    setShowErrorMessage({ ...showErrorMessage, serviceType: false });
    setSelectServiceType(type);
  };

  const serviceCategoryHandler = (category: ServiceCategory) => {
    setShowErrorMessage({ ...showErrorMessage, serviceType: false });
    setSelectServiceType('');
    history.push(getAddServicePath(category));
  };

  const handleSelectServiceCancel = () => {
    history.push(ROUTES.SERVICES);
  };

  const handleSelectServiceNextClick = () => {
    if (selectServiceType) {
      setActiveStepperStep(2);
    } else {
      setShowErrorMessage({ ...showErrorMessage, serviceType: true });
    }
  };

  const handleConfigureServiceBackClick = () => {
    setActiveStepperStep(1);
  };

  const handleConfigureServiceNextClick = (description: string) => {
    setDescription(description);
    if (serviceName.trim()) {
      setActiveStepperStep(3);
    } else {
      setShowErrorMessage({ ...showErrorMessage, name: true });
    }
  };

  const handleSubmit = () => {
    let dataObj: DataObj = {
      description: description,
      name: serviceName,
      serviceType: selectServiceType,
    };

    switch (serviceCategory) {
      case ServiceCategory.DATABASE_SERVICES:
        {
          dataObj = {
            ...dataObj,
            databaseConnection: {
              hostPort: `${url}:${port}`,
              connectionArguments: getKeyValueObject(connectionArguments),
              connectionOptions: getKeyValueObject(connectionOptions),
              database: database,
              password: password,
              username: username,
            },
          };
        }

        break;
      case ServiceCategory.MESSAGING_SERVICES:
        {
          dataObj = {
            ...dataObj,
            brokers:
              selectServiceType === MessagingServiceType.Pulsar
                ? [brokers]
                : brokers.split(',').map((broker) => broker.trim()),
            schemaRegistry: schemaRegistry,
          };
        }

        break;
      case ServiceCategory.DASHBOARD_SERVICES:
        {
          switch (selectServiceType) {
            case DashboardServiceType.Redash:
              {
                dataObj = {
                  ...dataObj,
                  dashboardUrl: dashboardUrl,
                  // eslint-disable-next-line @typescript-eslint/camelcase
                  api_key: apiKey,
                };
              }

              break;
            case DashboardServiceType.Tableau:
              {
                dataObj = {
                  ...dataObj,
                  dashboardUrl: dashboardUrl,
                  // eslint-disable-next-line @typescript-eslint/camelcase
                  site_name: siteName,
                  username: username,
                  password: password,
                  // eslint-disable-next-line @typescript-eslint/camelcase
                  api_version: apiVersion,
                  server: server,
                };
              }

              break;
            default:
              {
                dataObj = {
                  ...dataObj,
                  dashboardUrl: dashboardUrl,
                  username: username,
                  password: password,
                };
              }

              break;
          }
        }

        break;
      case ServiceCategory.PIPELINE_SERVICES:
        {
          dataObj = {
            ...dataObj,
            pipelineUrl: pipelineUrl,
          };
        }

        break;
      default:
        break;
    }
    onSave(dataObj);
    setActiveStepperStep(4);
  };

  const handleConnectionDetailsSubmitClick = () => {
    // validation will go here

    handleSubmit();
  };

  const handleConnectionDetailsBackClick = () => {
    setActiveStepperStep(2);
  };

  const addConnectionOptionFields = () => {
    setConnectionOptions([...connectionOptions, { key: '', value: '' }]);
  };

  const removeConnectionOptionFields = (i: number) => {
    const newFormValues = [...connectionOptions];
    newFormValues.splice(i, 1);
    setConnectionOptions(newFormValues);
  };

  const handleConnectionOptionFieldsChange = (
    i: number,
    field: keyof DynamicFormFieldType,
    value: string
  ) => {
    const newFormValues = [...connectionOptions];
    newFormValues[i][field] = value;
    setConnectionOptions(newFormValues);
  };

  const addConnectionArgumentFields = () => {
    setConnectionArguments([...connectionArguments, { key: '', value: '' }]);
  };

  const removeConnectionArgumentFields = (i: number) => {
    const newFormValues = [...connectionArguments];
    newFormValues.splice(i, 1);
    setConnectionArguments(newFormValues);
  };

  const handleConnectionArgumentFieldsChange = (
    i: number,
    field: keyof DynamicFormFieldType,
    value: string
  ) => {
    const newFormValues = [...connectionArguments];
    newFormValues[i][field] = value;
    setConnectionArguments(newFormValues);
  };

  const handleValidation = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = event.target.value;
    const name = event.target.name;

    switch (name) {
      case 'serviceName':
        setServiceName(value.trim());
        setShowErrorMessage({ ...showErrorMessage, name: false });

        break;

      case 'url':
        setUrl(value);

        break;

      case 'port':
        if (ONLY_NUMBER_REGEX.test(value) || value === '') {
          setPort(value);
        }

        break;

      case 'database':
        setDatabase(value);

        break;

      case 'username':
        setUsername(value);

        break;

      case 'password':
        setPassword(value);

        break;

      case 'warehouse':
        setWarehouse(value);

        break;

      case 'account':
        setAccount(value);

        break;

      case 'brokers':
        setBrokers(value);

        break;

      case 'schemaRegistry':
        setSchemaRegistry(value);

        break;

      case 'pipelineUrl':
        setPipelineUrl(value);

        break;

      case 'dashboardUrl':
        setDashboardUrl(value);

        break;

      case 'env':
        setEnv(value);

        break;

      case 'apiVersion':
        setApiVersion(value);

        break;

      case 'server':
        setServer(value);

        break;

      case 'siteName':
        setSiteName(value);

        break;

      case 'apiKey':
        setApiKey(value);

        break;
    }
  };

  const isIngestionSupported = () => {
    return (
      getIsIngestionEnable(serviceCategory as ServiceCategory) &&
      (getAirflowPipelineTypes(selectServiceType, true) || []).length > 0
    );
  };

  const fetchRightPanel = () => {
    return (
      <>
        <h6 className="tw-heading tw-text-base">Add Service</h6>
        <div className="tw-mb-5">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis eum
          eveniet est? Aperiam perspiciatis est quis saepe optio fugiat
          necessitatibus libero, consectetur, vitae rerum ex! Lorem ipsum dolor
          sit amet consectetur adipisicing elit. Facilis eum eveniet est?
          Aperiam perspiciatis est quis saepe optio fugiat necessitatibus
          libero, consectetur, vitae rerum ex!
        </div>
      </>
    );
  };

  return (
    <PageLayout
      classes="tw-max-w-full-hd tw-h-full tw-bg-white tw-pt-4"
      layout={PageLayoutType['2ColRTL']}
      rightPanel={fetchRightPanel()}>
      <h6 className="tw-heading tw-text-base">Add New Service</h6>
      <IngestionStepper
        activeStep={activeStepperStep}
        stepperLineClassName="add-service-line"
        steps={STEPS_FOR_ADD_SERVICE}
      />
      <div className="tw-pt-5">
        {activeStepperStep === 1 && (
          <SelectServiceType
            handleServiceTypeClick={handleServiceTypeClick}
            selectServiceType={selectServiceType}
            serviceCategory={serviceCategory}
            serviceCategoryHandler={serviceCategoryHandler}
            showError={showErrorMessage.serviceType}
            onCancel={handleSelectServiceCancel}
            onNext={handleSelectServiceNextClick}
          />
        )}

        {activeStepperStep === 2 && (
          <ConfigureService
            description={description}
            handleValidation={handleValidation}
            serviceName={serviceName}
            showError={{
              name: showErrorMessage.name,
              duplicateName: showErrorMessage.duplicateName,
            }}
            onBack={handleConfigureServiceBackClick}
            onNext={handleConfigureServiceNextClick}
          />
        )}

        {activeStepperStep === 3 && (
          <ConnectionDetails
            account={account}
            addConnectionArgumentFields={addConnectionArgumentFields}
            addConnectionOptionFields={addConnectionOptionFields}
            apiKey={apiKey}
            apiVersion={apiVersion}
            brokers={brokers}
            connectionArguments={connectionArguments}
            connectionOptions={connectionOptions}
            dashboardUrl={dashboardUrl}
            database={database}
            env={env}
            handleConnectionArgumentFieldsChange={
              handleConnectionArgumentFieldsChange
            }
            handleConnectionOptionFieldsChange={
              handleConnectionOptionFieldsChange
            }
            handleValidation={handleValidation}
            password={password}
            pipelineUrl={pipelineUrl}
            port={port}
            removeConnectionArgumentFields={removeConnectionArgumentFields}
            removeConnectionOptionFields={removeConnectionOptionFields}
            schemaRegistry={schemaRegistry}
            selectedService={selectServiceType}
            server={server}
            serviceCategory={serviceCategory}
            siteName={siteName}
            url={url}
            username={username}
            warehouse={warehouse}
            onBack={handleConnectionDetailsBackClick}
            onSubmit={handleConnectionDetailsSubmitClick}
          />
        )}

        {activeStepperStep > 3 && (
          <div className="tw-flex tw-flex-col tw-items-center tw-mt-14 tw-mb-24">
            <div className="tw-mb-7">
              <SVGIcons
                alt="success"
                className="tw-w-10 tw-h-10"
                icon={Icons.CIRCLE_CHECKBOX}
              />
            </div>
            <p className="tw-mb-7">
              <span className="tw-mr-1 tw-font-semibold">
                &quot;{serviceName}&quot;
              </span>
              <span>has been successfuly created</span>
            </p>

            <div>
              <Button
                data-testid="view-service-button"
                size="regular"
                theme="primary"
                variant="outlined"
                // this will be implementd once api integration is done, as we need FQN to re-direct
                // onClick={handleViewServiceClick}
              >
                <span>View Service</span>
              </Button>

              {isIngestionSupported() && (
                <Button
                  className="tw-ml-3.5"
                  data-testid="add-ingestion-button"
                  size="regular"
                  theme="primary"
                  variant="contained"
                  onClick={() => handleAddIngestion(true)}>
                  <span>Add Ingestion</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AddService;
