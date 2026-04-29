import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import AppLayout from '../components/layout/AppLayout';
import WeightTrendChart from '../components/features/WeightTrendChart';
import { measurementsService, CreateMeasurementData } from '../services/measurements.service';
import { Measurement } from '../types';

type MeasurementTab = 'weight' | 'body-composition' | 'body-measurements';

export default function Measurements() {
  const [activeTab, setActiveTab] = useState<MeasurementTab>('weight');
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [_showWeightForm, setShowWeightForm] = useState(false);

  // Weight form
  const [weightFormData, setWeightFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: '',
    notes: '',
  });

  // Body composition form
  const [bodyCompFormData, setBodyCompFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    bodyFatPercent: '',
    muscleMass: '',
    waterPercent: '',
    notes: '',
  });

  // Body measurements form
  const [bodyMeasFormData, setBodyMeasFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    neck: '',
    shoulders: '',
    chest: '',
    waist: '',
    hips: '',
    leftArm: '',
    rightArm: '',
    leftThigh: '',
    rightThigh: '',
    notes: '',
  });

  useEffect(() => {
    loadMeasurements();
  }, [activeTab]);

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      const typeMap = {
        weight: 'WEIGHT',
        'body-composition': 'BODY_COMPOSITION',
        'body-measurements': 'BODY_MEASUREMENTS',
      };

      const response = await measurementsService.getMeasurements({
        measurementType: typeMap[activeTab] as any,
        limit: 10,
      });
      setMeasurements(response.measurements);
    } catch (error) {
      console.error('Failed to load measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!weightFormData.weight) return;

    try {
      const data: CreateMeasurementData = {
        date: weightFormData.date,
        measurementType: 'WEIGHT',
        weight: parseFloat(weightFormData.weight),
        notes: weightFormData.notes || undefined,
      };

      await measurementsService.createMeasurement(data);
      setShowWeightForm(false);
      setWeightFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        weight: '',
        notes: '',
      });
      loadMeasurements();
    } catch (error) {
      console.error('Failed to add weight:', error);
      alert('Failed to add weight measurement');
    }
  };

  const handleBodyCompSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data: CreateMeasurementData = {
        date: bodyCompFormData.date,
        measurementType: 'BODY_COMPOSITION',
        bodyFatPercent: bodyCompFormData.bodyFatPercent ? parseFloat(bodyCompFormData.bodyFatPercent) : undefined,
        muscleMass: bodyCompFormData.muscleMass ? parseFloat(bodyCompFormData.muscleMass) : undefined,
        waterPercent: bodyCompFormData.waterPercent ? parseFloat(bodyCompFormData.waterPercent) : undefined,
        notes: bodyCompFormData.notes || undefined,
      };

      await measurementsService.createMeasurement(data);
      setBodyCompFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        bodyFatPercent: '',
        muscleMass: '',
        waterPercent: '',
        notes: '',
      });
      loadMeasurements();
    } catch (error) {
      console.error('Failed to add body composition:', error);
      alert('Failed to add body composition');
    }
  };

  const handleBodyMeasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data: CreateMeasurementData = {
        date: bodyMeasFormData.date,
        measurementType: 'BODY_MEASUREMENTS',
        neck: bodyMeasFormData.neck ? parseFloat(bodyMeasFormData.neck) : undefined,
        shoulders: bodyMeasFormData.shoulders ? parseFloat(bodyMeasFormData.shoulders) : undefined,
        chest: bodyMeasFormData.chest ? parseFloat(bodyMeasFormData.chest) : undefined,
        waist: bodyMeasFormData.waist ? parseFloat(bodyMeasFormData.waist) : undefined,
        hips: bodyMeasFormData.hips ? parseFloat(bodyMeasFormData.hips) : undefined,
        leftArm: bodyMeasFormData.leftArm ? parseFloat(bodyMeasFormData.leftArm) : undefined,
        rightArm: bodyMeasFormData.rightArm ? parseFloat(bodyMeasFormData.rightArm) : undefined,
        leftThigh: bodyMeasFormData.leftThigh ? parseFloat(bodyMeasFormData.leftThigh) : undefined,
        rightThigh: bodyMeasFormData.rightThigh ? parseFloat(bodyMeasFormData.rightThigh) : undefined,
        notes: bodyMeasFormData.notes || undefined,
      };

      await measurementsService.createMeasurement(data);
      setBodyMeasFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        neck: '',
        shoulders: '',
        chest: '',
        waist: '',
        hips: '',
        leftArm: '',
        rightArm: '',
        leftThigh: '',
        rightThigh: '',
        notes: '',
      });
      loadMeasurements();
    } catch (error) {
      console.error('Failed to add body measurements:', error);
      alert('Failed to add body measurements');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this measurement?')) return;

    try {
      await measurementsService.deleteMeasurement(id);
      loadMeasurements();
    } catch (error) {
      console.error('Failed to delete measurement:', error);
      alert('Failed to delete measurement');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Measurements</h1>
          <p className="text-gray-600 mt-1">Track your weight and body measurements</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('weight')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'weight'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Weight
              </button>
              <button
                onClick={() => setActiveTab('body-composition')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'body-composition'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Body Composition
              </button>
              <button
                onClick={() => setActiveTab('body-measurements')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'body-measurements'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Body Measurements
              </button>
            </nav>
          </div>
        </div>

        {/* Weight Trend Chart - only show for weight tab */}
        {activeTab === 'weight' && (
          <div className="mb-6">
            <WeightTrendChart days={30} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Column */}
          <div className="lg:col-span-1">
            {/* Weight Form */}
            {activeTab === 'weight' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Log Weight</h2>
                <form onSubmit={handleWeightSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={weightFormData.date}
                      onChange={(e) =>
                        setWeightFormData({ ...weightFormData, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightFormData.weight}
                      onChange={(e) =>
                        setWeightFormData({ ...weightFormData, weight: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={weightFormData.notes}
                      onChange={(e) =>
                        setWeightFormData({ ...weightFormData, notes: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Log Weight
                  </button>
                </form>
              </div>
            )}

            {/* Body Composition Form */}
            {activeTab === 'body-composition' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Log Body Composition
                </h2>
                <form onSubmit={handleBodyCompSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={bodyCompFormData.date}
                      onChange={(e) =>
                        setBodyCompFormData({ ...bodyCompFormData, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Body Fat (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={bodyCompFormData.bodyFatPercent}
                      onChange={(e) =>
                        setBodyCompFormData({
                          ...bodyCompFormData,
                          bodyFatPercent: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Muscle Mass (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={bodyCompFormData.muscleMass}
                      onChange={(e) =>
                        setBodyCompFormData({
                          ...bodyCompFormData,
                          muscleMass: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Water (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={bodyCompFormData.waterPercent}
                      onChange={(e) =>
                        setBodyCompFormData({
                          ...bodyCompFormData,
                          waterPercent: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={bodyCompFormData.notes}
                      onChange={(e) =>
                        setBodyCompFormData({ ...bodyCompFormData, notes: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Log Body Composition
                  </button>
                </form>
              </div>
            )}

            {/* Body Measurements Form */}
            {activeTab === 'body-measurements' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Log Body Measurements
                </h2>
                <form onSubmit={handleBodyMeasSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={bodyMeasFormData.date}
                      onChange={(e) =>
                        setBodyMeasFormData({ ...bodyMeasFormData, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Neck (cm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={bodyMeasFormData.neck}
                        onChange={(e) =>
                          setBodyMeasFormData({ ...bodyMeasFormData, neck: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chest (cm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={bodyMeasFormData.chest}
                        onChange={(e) =>
                          setBodyMeasFormData({ ...bodyMeasFormData, chest: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Waist (cm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={bodyMeasFormData.waist}
                        onChange={(e) =>
                          setBodyMeasFormData({ ...bodyMeasFormData, waist: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hips (cm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={bodyMeasFormData.hips}
                        onChange={(e) =>
                          setBodyMeasFormData({ ...bodyMeasFormData, hips: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Left Arm (cm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={bodyMeasFormData.leftArm}
                        onChange={(e) =>
                          setBodyMeasFormData({ ...bodyMeasFormData, leftArm: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Right Arm (cm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={bodyMeasFormData.rightArm}
                        onChange={(e) =>
                          setBodyMeasFormData({ ...bodyMeasFormData, rightArm: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Left Thigh (cm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={bodyMeasFormData.leftThigh}
                        onChange={(e) =>
                          setBodyMeasFormData({
                            ...bodyMeasFormData,
                            leftThigh: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Right Thigh (cm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={bodyMeasFormData.rightThigh}
                        onChange={(e) =>
                          setBodyMeasFormData({
                            ...bodyMeasFormData,
                            rightThigh: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={bodyMeasFormData.notes}
                      onChange={(e) =>
                        setBodyMeasFormData({ ...bodyMeasFormData, notes: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Log Measurements
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* History Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">History</h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : measurements.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No measurements recorded yet</p>
              ) : (
                <div className="space-y-4">
                  {measurements.map((measurement) => (
                    <div
                      key={measurement.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-gray-600 mb-1">
                            {format(new Date(measurement.date), 'EEEE, MMMM d, yyyy')}
                          </div>

                          {activeTab === 'weight' && measurement.weight && (
                            <div className="space-y-1">
                              <div className="text-lg font-semibold text-gray-800">
                                {measurement.weight} kg
                              </div>
                              {measurement.bmi && (
                                <div className="text-sm text-gray-600">
                                  BMI: {measurement.bmi}
                                </div>
                              )}
                            </div>
                          )}

                          {activeTab === 'body-composition' && (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {measurement.bodyFatPercent !== null && (
                                <div>Body Fat: {measurement.bodyFatPercent}%</div>
                              )}
                              {measurement.muscleMass !== null && (
                                <div>Muscle: {measurement.muscleMass} kg</div>
                              )}
                              {measurement.waterPercent !== null && (
                                <div>Water: {measurement.waterPercent}%</div>
                              )}
                            </div>
                          )}

                          {activeTab === 'body-measurements' && (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {measurement.chest && <div>Chest: {measurement.chest} cm</div>}
                              {measurement.waist && <div>Waist: {measurement.waist} cm</div>}
                              {measurement.hips && <div>Hips: {measurement.hips} cm</div>}
                              {measurement.leftArm && <div>L.Arm: {measurement.leftArm} cm</div>}
                              {measurement.rightArm && <div>R.Arm: {measurement.rightArm} cm</div>}
                              {measurement.leftThigh && (
                                <div>L.Thigh: {measurement.leftThigh} cm</div>
                              )}
                            </div>
                          )}

                          {measurement.notes && (
                            <div className="text-sm text-gray-600 mt-2 italic">
                              {measurement.notes}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleDelete(measurement.id)}
                          className="ml-4 text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
